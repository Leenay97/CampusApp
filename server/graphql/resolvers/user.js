import { Op } from 'sequelize';
import {
  User,
  Workshop,
  Group,
  Season,
  House,
  Class,
  Place,
  LifeFineHistory,
  sequelize,
} from '../../models/index.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { isStaff, requireAuth, requireStaff, requireAdmin, requireSelfOrStaff } from '../auth.js';
import { logCoinTransaction, isDuplicateTransfer } from './coinTransaction.js';

function todayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
}

const DUPLICATE_FINE_WINDOW_MS = 5000;

// transaction обязателен: проверку нужно делать после блокировки строки
// студента, иначе два параллельных штрафа оба увидят пустую историю.
async function isDuplicateFine(studentId, date, transaction) {
  const recent = await LifeFineHistory.findOne({
    where: {
      studentId,
      date,
      updatedAt: { [Op.gte]: new Date(Date.now() - DUPLICATE_FINE_WINDOW_MS) },
    },
    transaction,
  });
  return Boolean(recent);
}

export const userResolvers = {
  User: {
    // Логин видят только персонал и сам пользователь — публичные запросы
    // (например, список учителей на странице регистрации) его не получат.
    login: (parent, _, context) => {
      const auth = context?.auth;
      if (isStaff(auth) || String(auth?.id) === String(parent.id)) {
        return parent.login;
      }
      return null;
    },
  },

  Query: {
    students: async (_, { groupId }, context) => {
      // С groupId запрос публичный: страница регистрации показывает
      // состав группы по ссылке-приглашению. Полный список — только персоналу.
      if (groupId) {
        return await User.findAll({
          where: { userLevel: 'STUDENT', groupId },
        });
      }
      requireStaff(context);
      return await User.findAll({
        where: { userLevel: 'STUDENT' },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'attendingWorkshops' },
        ],
      });
    },
    // Публичный: страница регистрации учителей ("Найди себя"), поэтому админы
    // сюда не попадают по умолчанию — только по явному includeAdmins,
    // который запрашивают формы мастерклассов и Sport Time.
    teachers: async (_, { includeAdmins }) => {
      return await User.findAll({
        where: { userLevel: includeAdmins ? ['TEACHER', 'ADMIN'] : 'TEACHER' },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'teachingWorkshops' },
        ],
      });
    },
    user: async (_, { id }, context) => {
      requireAuth(context);
      return await User.findByPk(id, {
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'attendingWorkshops' },
          { model: Class, as: 'class', include: [{ model: Place, as: 'place' }] },
        ],
      });
    },

    usersByGroup: async (_, { groupId }, context) => {
      requireAuth(context);
      return await User.findAll({
        where: { groupId, userLevel: 'STUDENT' },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'attendingWorkshops' },
          { model: House, as: 'house' },
          { model: Class, as: 'class' },
        ],
      });
    },

    usersByWorkshop: async (_, { workshopId }, context) => {
      requireAuth(context);
      const workshop = await Workshop.findByPk(workshopId);
      if (!workshop) return [];
      return await User.findAll({
        where: { id: workshop.userId },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'attendingWorkshops' },
        ],
      });
    },

    seasonStudents: async (_, __, context) => {
      requireStaff(context);
      const activeSeason = await Season.findOne({ where: { isActive: true } });
      return await User.findAll({
        where: { userLevel: 'STUDENT', seasonId: activeSeason.id },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'attendingWorkshops' },
          { model: House, as: 'house' },
          { model: Class, as: 'class' },
        ],
      });
    },

    teacherRegistrationToken: async (_, __, context) => {
      requireAdmin(context);
      return process.env.TEACHER_REGISTRATION_TOKEN;
    },

    lifeFineHistory: async (_, __, context) => {
      requireAdmin(context);
      return await LifeFineHistory.findAll({
        include: [{ model: User, as: 'student', include: [{ model: Group, as: 'group' }] }],
        order: [['date', 'DESC']],
      });
    },
  },

  Mutation: {
    login: async (_, { login, password }) => {
      const user = await User.findOne({
        where: { login },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'attendingWorkshops' },
        ],
      });
      if (!user) throw new Error('Пользователя не существует');

      const userLevel = user.userLevel;

      const isValid = await bcrypt.compare(password, user.hashedPassword);
      if (!isValid) throw new Error('Неверный пароль');

      const season = await Season.findOne({ where: { isActive: true } });

      if (!season && userLevel == 'STUDENT') throw new Error('Кажется сезон еще не начался');

      let group;
      if (userLevel !== 'ADMIN') {
        group = await Group.findOne({ where: { id: user.groupId } });
      }

      if (!user.group && userLevel == 'STUDENT') throw new Error('У пользователя нет группы');

      const token = jwt.sign(
        {
          id: user.id,
          userLevel: user.userLevel,
          seasonId: season?.id || null,
          groupId: group?.id || null,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '30d',
        },
      );

      return {
        token,
        user,
        group,
      };
    },
    createStudent: async (_, { russianName, groupId, birthday }, context) => {
      requireStaff(context);
      const group = await Group.findByPk(groupId);
      if (!group) throw new Error('Группы не существует');
      if (!group.seasonId) throw new Error('Группа не принадлежит сезону');

      const existingStudent = await User.findOne({
        where: { russianName, groupId, userLevel: 'STUDENT' },
      });
      if (existingStudent) throw new Error('Студент с таким именем уже есть в группе');

      const user = await User.create({
        russianName,
        groupId: group.id,
        seasonId: group.seasonId,
        coins: 0,
        userLevel: 'STUDENT',
        lives: 3,
        birthday: birthday || null,
      });

      return user;
    },

    createTeacher: async (_, { name }, context) => {
      requireAdmin(context);
      const existingTeacher = await User.findOne({ where: { name, userLevel: 'TEACHER' } });
      if (existingTeacher) throw new Error('Teacher already exists');

      const user = await User.create({
        name,
        userLevel: 'TEACHER',
      });

      return user;
    },

    registerTeacher: async (_, { token, id, login, password, confirmPassword }) => {
      if (!login || !password) throw new Error('Введите пароль и логин');

      if (password !== confirmPassword) throw new Error('Пароли не совпадают');

      if (token !== process.env.TEACHER_REGISTRATION_TOKEN) throw new Error('Неверная ссылка');

      const teacher = await User.findByPk(id);

      if (!teacher) throw new Error('Учителя не существует');
      if (teacher.isActive) throw new Error('Учитель уже зарегистрирован');

      const existingLogin = await User.findOne({ where: { login } });
      if (existingLogin) throw new Error('Логин уже занят');

      const hashedPassword = await bcrypt.hash(password, 10);
      teacher.hashedPassword = hashedPassword;
      teacher.login = login;
      teacher.isActive = true;

      await teacher.save();

      const tokenForLogin = jwt.sign(
        { id: teacher.id, userLevel: teacher.userLevel },
        process.env.JWT_SECRET,
        { expiresIn: '30d' },
      );

      return {
        token: tokenForLogin,
        user: teacher,
      };
    },

    registerStudent: async (_, { token, id, name, login, password, confirmPassword }) => {
      if (!login || !password) throw new Error('Введите пароль и логин');
      if (password !== confirmPassword) throw new Error('Пароли не совпадают');
      if (!name) throw new Error('Введите английское имя');

      const group = await Group.findByPk(token);
      if (!group) throw new Error('Группа не существует');

      const student = await User.findByPk(id);
      if (!student || student.userLevel !== 'STUDENT') throw new Error('Студента не существует');
      if (student.groupId !== group.id) throw new Error('Студент не принадлежит этой группе');
      if (student.isActive) throw new Error('Студент уже зарегистрирован');

      const existingLogin = await User.findOne({ where: { login } });
      if (existingLogin) throw new Error('Логин уже занят');

      const hashedPassword = await bcrypt.hash(password, 10);

      student.name = name;
      student.login = login;
      student.hashedPassword = hashedPassword;
      student.isActive = true;
      await student.save();

      const tokenForLogin = jwt.sign(
        {
          id: student.id,
          userLevel: student.userLevel,
          name: student.name,
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' },
      );

      return {
        token: tokenForLogin,
        user: student,
      };
    },

    registerStudentWithExistingAccount: async (_, { token, login, password }) => {
      if (!login || !password) throw new Error('Введите пароль и логин');

      const group = await Group.findByPk(token);
      if (!group) throw new Error('Группа не существует');
      if (!group.seasonId) throw new Error('Группа не принадлежит сезону');

      const student = await User.findOne({ where: { login, userLevel: 'STUDENT' } });
      if (!student || !student.hashedPassword) throw new Error('Неверный логин или пароль');

      const isPasswordValid = await bcrypt.compare(password, student.hashedPassword);
      if (!isPasswordValid) throw new Error('Неверный логин или пароль');

      if (student.seasonId === group.seasonId)
        throw new Error('Студент уже зарегистрирован в этом сезоне');

      // Прикрепляем существующий аккаунт к группе нового сезона,
      // сезонные поля начинаются с чистого листа
      student.groupId = group.id;
      student.seasonId = group.seasonId;
      student.coins = 0;
      student.lives = 3;
      student.votes = null;
      student.gotWorkshopCoins = null;
      student.classId = null;
      student.houseId = null;
      student.isActive = true;
      await student.save();

      const tokenForLogin = jwt.sign(
        {
          id: student.id,
          userLevel: student.userLevel,
          name: student.name,
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' },
      );

      return {
        token: tokenForLogin,
        user: student,
      };
    },

    updateUser: async (
      _,
      { id, name, russianName, groupId, houseId, englishLevel, classId, coins, birthday },
      context,
    ) => {
      requireStaff(context);
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');

      user.name = name !== undefined ? name : user.name;
      user.russianName = russianName !== undefined ? russianName : user.russianName;
      user.groupId = groupId || user.groupId;
      user.houseId = houseId || user.houseId;
      user.classId = classId || user.classId;
      user.englishLevel = englishLevel !== undefined ? englishLevel : user.englishLevel;
      user.birthday = birthday !== undefined ? birthday : user.birthday;
      // null не должен стирать баланс: клиент присылал его вместо нуля, coins
      // уходил в NULL, и после этого SQL-инкремент в групповых начислениях молча
      // перестаёт работать (NULL + N = NULL). Ноль при этом — законное значение,
      // поэтому проверяем именно на число, а не на truthy.
      const coinsProvided = typeof coins === 'number' && Number.isFinite(coins);
      const coinsDelta = coinsProvided ? coins - (user.coins ?? 0) : 0;
      user.coins = coinsProvided ? coins : user.coins;

      await user.save();
      await user.reload({
        include: [
          { model: Group, as: 'group' },
          { model: House, as: 'house' },
          { model: Class, as: 'class' },
        ],
      });

      if (coinsDelta !== 0) {
        await logCoinTransaction({
          studentId: user.id,
          amount: coinsDelta,
          counterpartyId: context.auth.id,
          reason: 'admin',
        });
      }

      return user;
    },

    deleteUser: async (_, { id }, context) => {
      requireAdmin(context);
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');

      if (user.userLevel === 'TEACHER' && user.groupId) {
        throw new Error('Cannot delete teacher with assigned group');
      }

      await user.destroy();
      return user;
    },
    deleteUnregisteredStudents: async (_, { groupId }, context) => {
      const auth = requireStaff(context);
      if (auth.userLevel === 'TEACHER' && String(auth.groupId) !== String(groupId)) {
        throw new Error('Доступ запрещен');
      }

      const students = await User.findAll({ where: { groupId, userLevel: 'STUDENT' } });
      // hashedPassword, а не password: поля password в модели нет, поэтому
      // прежняя проверка на него была всегда истинной и ничего не защищала
      const unregistered = students.filter((student) => !student.name && !student.hashedPassword);
      await User.destroy({ where: { id: unregistered.map((student) => student.id) } });

      return unregistered;
    },

    transferCoins: async (_, { userId, recieverId, amount }, context) => {
      // Переводить можно только от собственного имени
      requireSelfOrStaff(context, userId);

      // Транзакция + блокировка строк: без этого два параллельных перевода от
      // одного отправителя могут оба пройти проверку баланса по одному и тому же
      // прочитанному значению coins и увести баланс в минус (потерянное обновление).
      const { sender, reciever } = await sequelize.transaction(async (t) => {
        const rows = await User.findAll({
          where: { id: [userId, recieverId] },
          order: [['id', 'ASC']],
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        const byId = new Map(rows.map((row) => [String(row.id), row]));
        const user = byId.get(String(userId));
        const reciever = byId.get(String(recieverId));

        if (!user) throw new Error('Отправитель не найден');
        if (!reciever) throw new Error('Получатель не найден');
        if (user.id === reciever.id) throw new Error('Нельзя переводить себе');
        if (amount <= 0) throw new Error('Некорректная сумма');

        // Только после блокировки: до неё оба параллельных запроса видят
        // пустую историю и оба проводят перевод, списывая сумму дважды.
        const isDuplicate = await isDuplicateTransfer(
          { studentIds: [recieverId], counterpartyId: userId, amount },
          t,
        );
        if (isDuplicate) {
          throw new Error('Такой перевод уже был отправлен только что — подождите немного');
        }

        const senderIsStudent = user.userLevel === 'STUDENT';
        if (senderIsStudent) {
          if (user.coins < amount) {
            throw new Error('Недостаточно Coins');
          }
          user.coins -= amount;
        }

        reciever.coins += amount;
        await user.save({ transaction: t });
        await reciever.save({ transaction: t });

        if (senderIsStudent) {
          await logCoinTransaction(
            {
              studentId: user.id,
              amount: -amount,
              counterpartyId: reciever.id,
              reason: 'transfer',
            },
            t,
          );
        }
        await logCoinTransaction(
          { studentId: reciever.id, amount, counterpartyId: user.id, reason: 'transfer' },
          t,
        );

        return { sender: user, reciever };
      });

      // Пуш уходит в фоне, ответ мутации его не ждёт
      context.sendPushNotification(
        reciever.id,
        '🪙 Тебе перевели coins',
        `${sender.name}: +${amount}`,
        '/',
      );

      return sender;
    },

    transferCoinsToGroup: async (_, { groupId, amount }, context) => {
      // Массовое начисление без списания у отправителя — доступно только персоналу.
      // Отправителя берём из токена, а не из аргумента: иначе сотрудник может
      // подписать начисление чужим именем — и в истории, и в пуше.
      const { id: userId } = requireStaff(context);
      if (amount <= 0) throw new Error('Некорректная сумма');

      // Одна транзакция на всё начисление: иначе ошибка на середине списка
      // оставит часть группы с монетами, а часть без, и откатить это нечем.
      const { sender, students } = await sequelize.transaction(async (t) => {
        const groupStudents = await User.findAll({
          where: { groupId, userLevel: 'STUDENT' },
          attributes: ['id'],
          transaction: t,
        });
        if (groupStudents.length === 0) throw new Error('В группе нет студентов');

        const studentIds = groupStudents.map((student) => student.id);

        // Блокируем отправителя и студентов одним запросом в порядке id — тем же,
        // что и в transferCoins. Общий порядок блокировки исключает взаимоблокировку
        // встречных переводов, а сама блокировка нужна до проверки повтора ниже:
        // без неё два параллельных запроса оба увидят пустую историю.
        const rows = await User.findAll({
          where: { id: [userId, ...studentIds] },
          order: [['id', 'ASC']],
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        const user = rows.find((row) => String(row.id) === String(userId));
        if (!user) throw new Error('Отправитель не найден');

        const isDuplicate = await isDuplicateTransfer(
          { studentIds, counterpartyId: user.id, amount, reason: 'group_transfer' },
          t,
        );
        if (isDuplicate) {
          throw new Error('Такой перевод группе уже был отправлен только что — подождите немного');
        }

        // NULL + N в SQL даёт NULL, поэтому такой студент молча не получил бы
        // начисление, хотя запись в историю ниже всё равно появилась бы.
        // Строки уже заблокированы выше, так что гонки здесь нет.
        await User.update({ coins: 0 }, { where: { id: studentIds, coins: null }, transaction: t });

        // increment — атомарный UPDATE на уровне БД, а не read-modify-write,
        // так что параллельные начисления этим же студентам не теряют друг друга
        await User.increment('coins', { by: amount, where: { id: studentIds }, transaction: t });

        for (const studentId of studentIds) {
          await logCoinTransaction(
            { studentId, amount, counterpartyId: user.id, reason: 'group_transfer' },
            t,
          );
        }

        // Перечитываем после increment, иначе в ответ уйдут доинкрементные coins
        const updatedStudents = await User.findAll({
          where: { id: studentIds },
          transaction: t,
        });

        return { sender: user, students: updatedStudents };
      });

      // Пуши уходят после коммита и в фоне, ответ мутации их не ждёт
      for (const student of students) {
        context.sendPushNotification(
          student.id,
          'Тебе перевели coins',
          `${sender.name}: +${amount}`,
          '/',
        );
      }

      return students;
    },

    generatePasswordResetLink: async (_, { userId }, context) => {
      requireStaff(context);

      const user = await User.findByPk(userId);
      if (!user) throw new Error('Пользователь не найден');
      if (user.userLevel === 'ADMIN') throw new Error('Нельзя сбросить пароль администратора');

      // Алфавит без похожих символов (0/O, 1/I/L), чтобы код можно было диктовать
      const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
      let code;
      do {
        code = Array.from({ length: 5 }, () => alphabet[crypto.randomInt(alphabet.length)]).join(
          '',
        );
      } while (await User.findOne({ where: { resetCode: code } }));

      user.resetCode = code;
      user.resetCodeExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
      await user.save();

      return code;
    },

    resetPassword: async (_, { token, password, confirmPassword }) => {
      if (!password || password !== confirmPassword) throw new Error('Пароли не совпадают');
      if (!token) throw new Error('Неверная ссылка');

      const user = await User.findOne({ where: { resetCode: token.trim().toUpperCase() } });
      if (!user || !user.resetCodeExpiresAt || user.resetCodeExpiresAt < new Date()) {
        throw new Error('Ссылка недействительна или истекла');
      }

      user.hashedPassword = await bcrypt.hash(password, 10);
      user.resetCode = null;
      user.resetCodeExpiresAt = null;
      await user.save();

      return true;
    },

    changePassword: async (_, { currentPassword, newPassword, confirmPassword }, context) => {
      const auth = requireStaff(context);
      if (!newPassword || newPassword !== confirmPassword) throw new Error('Пароли не совпадают');

      const user = await User.findByPk(auth.id);
      if (!user || !user.hashedPassword) throw new Error('Пользователь не найден');

      const isValid = await bcrypt.compare(currentPassword, user.hashedPassword);
      if (!isValid) throw new Error('Неверный текущий пароль');

      user.hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.save();

      return true;
    },

    fineUser: async (_, { id }, context) => {
      requireStaff(context);
      const date = todayDate();

      // Блокировка строки студента: без неё два одновременных штрафа могут оба
      // прочитать одно и то же значение lives и списать только одну жизнь на двоих.
      const user = await sequelize.transaction(async (t) => {
        const user = await User.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
        if (!user) throw new Error('Студент не найден');

        if (await isDuplicateFine(id, date, t)) {
          throw new Error('Этого студента только что уже штрафовали — подождите немного');
        }

        if (!user.lives || user.lives === 0) {
          throw new Error('У студента не осталось жизней');
        }
        user.lives -= 1;
        await user.save({ transaction: t });

        if (user.groupId) {
          await Group.increment('rubbers', { by: 1, where: { id: user.groupId }, transaction: t });
        }

        // История пишется здесь же: если оставить её после коммита, второй
        // запрос успеет взять блокировку раньше записи, не увидит штрафа
        // и спишет вторую жизнь.
        const [historyEntry, created] = await LifeFineHistory.findOrCreate({
          where: { studentId: id, date },
          defaults: { count: 1 },
          transaction: t,
        });
        if (!created) {
          historyEntry.count += 1;
          await historyEntry.save({ transaction: t });
        }

        return user;
      });

      return user;
    },

    uploadAvatar: async (_, { file, userId }, context) => {
      requireSelfOrStaff(context, userId);
      try {
        console.log('Starting upload for userId:', userId);

        const user = await User.findByPk(userId);
        if (!user) {
          throw new Error('User not found');
        }

        // Получаем данные файла из правильного места
        let uploadData;

        // Если есть file.file (как в вашем логе)
        if (file.file && file.file.createReadStream) {
          uploadData = file.file;
        }
        // Если есть promise
        else if (file.promise && typeof file.promise.then === 'function') {
          uploadData = await file.promise;
        }
        // Если file сам содержит createReadStream
        else if (file.createReadStream) {
          uploadData = file;
        } else {
          console.error('Unknown file structure:', file);
          throw new Error('Invalid file upload object');
        }

        const { createReadStream, mimetype, filename } = uploadData;

        console.log('Mimetype:', mimetype);
        console.log('Filename:', filename);

        // Валидация
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimes.includes(mimetype)) {
          throw new Error('Only JPEG, PNG, WEBP images are allowed');
        }

        // Определяем расширение из mimetype
        let ext = '';
        if (mimetype === 'image/jpeg') ext = '.jpg';
        if (mimetype === 'image/png') ext = '.png';
        if (mimetype === 'image/webp') ext = '.webp';

        // Генерируем уникальное имя
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
        console.log('Generated filename:', uniqueName);

        // Путь к папке
        const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
        console.log('Upload directory:', uploadDir);

        // Создаем директорию если её нет
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
          console.log('Created directory:', uploadDir);
        }

        const filePath = path.join(uploadDir, uniqueName);
        console.log('Full file path:', filePath);

        // Сохраняем файл
        const stream = createReadStream();
        const outStream = fs.createWriteStream(filePath);

        await new Promise((resolve, reject) => {
          stream.pipe(outStream);
          stream.on('error', (err) => {
            console.error('Stream error:', err);
            reject(err);
          });
          outStream.on('finish', () => {
            console.log('File saved successfully');
            resolve();
          });
        });

        // Удаляем старый аватар
        if (user.photoUrl) {
          const oldAvatarPath = path.join(process.cwd(), user.photoUrl);
          console.log('Old avatar path:', oldAvatarPath);
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
            console.log('Deleted old avatar');
          }
        }

        // Обновляем пользователя
        const photoUrl = `/uploads/avatars/${uniqueName}`;
        user.photoUrl = photoUrl;
        await user.save();

        console.log('User updated with photoUrl:', photoUrl);

        return user;
      } catch (error) {
        console.error('Upload error details:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }
    },

    deleteAvatar: async (_, { userId }, context) => {
      requireSelfOrStaff(context, userId);

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.photoUrl) {
        const avatarPath = path.join(process.cwd(), user.photoUrl);
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
        user.photoUrl = null;
        await user.save();
      }

      return user;
    },
  },
};
