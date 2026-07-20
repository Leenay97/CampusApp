import { User, Workshop, Group, Season, House, Class } from '../../models/index.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { isStaff, requireAuth, requireStaff, requireAdmin, requireSelfOrStaff } from '../auth.js';
import { logCoinTransaction } from './coinTransaction.js';

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
    // Публичный: страница регистрации учителей ("Найди себя").
    teachers: async () => {
      return await User.findAll({
        where: { userLevel: 'TEACHER' },
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
          { model: Class, as: 'class' },
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
    createStudent: async (_, { russianName, groupId }, context) => {
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
      { id, name, russianName, groupId, houseId, englishLevel, classId, coins },
      context,
    ) => {
      requireStaff(context);
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');

      user.name = name !== undefined ? name : user.name;
      user.russianName = russianName !== undefined ? russianName : user.russianName;
      user.groupId = groupId !== undefined ? groupId : user.groupId;
      user.houseId = houseId !== undefined ? houseId : user.houseId;
      user.englishLevel = englishLevel !== undefined ? englishLevel : user.englishLevel;
      user.classId = classId !== undefined ? classId : user.classId;
      const coinsDelta = coins !== undefined ? coins - (user.coins ?? 0) : 0;
      user.coins = coins !== undefined ? coins : user.coins;
      user.englishLevel = englishLevel !== undefined ? englishLevel : user.englishLevel;

      await user.save();

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
      const unregistered = students.filter((student) => !student.name && !student.password);
      await User.destroy({ where: { id: unregistered.map((student) => student.id) } });

      return unregistered;
    },

    transferCoins: async (_, { userId, recieverId, amount }, context) => {
      // Переводить можно только от собственного имени
      requireSelfOrStaff(context, userId);
      const user = await User.findByPk(userId);
      const reciever = await User.findByPk(recieverId);
      if (!user) throw new Error('Отправитель не найден');
      if (!reciever) throw new Error('Получатель не найден');
      if (user.id === reciever.id) throw new Error('Нельзя переводить себе');
      if (amount <= 0) throw new Error('Некорректная сумма');

      const senderIsStudent = user.userLevel === 'STUDENT';
      if (senderIsStudent) {
        if (user.coins < amount) {
          throw new Error('Недостаточно Coins');
        } else {
          user.coins -= amount;
        }
      }

      reciever.coins += amount;
      await user.save();
      await reciever.save();

      if (senderIsStudent) {
        await logCoinTransaction({
          studentId: user.id,
          amount: -amount,
          counterpartyId: reciever.id,
          reason: 'transfer',
        });
      }
      await logCoinTransaction({
        studentId: reciever.id,
        amount,
        counterpartyId: user.id,
        reason: 'transfer',
      });

      // Пуш уходит в фоне, ответ мутации его не ждёт
      context.sendPushNotification(
        reciever.id,
        '🪙 Тебе перевели coins',
        `${user.name}: +${amount}`,
        '/',
      );

      return user;
    },

    addWorkshop: async (_, { id, workshopId }, context) => {
      requireSelfOrStaff(context, id);
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');

      const workshop = await Workshop.findByPk(workshopId);
      if (!workshop) throw new Error('Workshop not found');

      await user.addWorkshop(workshop);
      return user;
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
      const user = await User.findByPk(id);
      if (!user) throw new Error('Студент не найден');
      const group = await Group.findOne({ where: { id: user.groupId } });

      if (!user.lives || user.lives === 0) {
        throw new Error('У студента не осталось жизней');
      }
      user.lives -= 1;

      if (group) {
        group.rubbers += 1;
        await group.save();
      }

      await user.save();

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
