import { User, Workshop, Group, Season, House, Class } from '../../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

export const userResolvers = {
  Query: {
    students: async (_, { groupId }) => {
      if (groupId) {
        return await User.findAll({
          where: { userLevel: 'STUDENT', groupId },
        });
      }
      return await User.findAll({
        where: { userLevel: 'STUDENT' },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'attendingWorkshops' },
        ],
      });
    },
    teachers: async () => {
      return await User.findAll({
        where: { userLevel: 'TEACHER' },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'teachingWorkshops' },
        ],
      });
    },
    user: async (_, { id }) => {
      return await User.findByPk(id, {
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'attendingWorkshops' },
        ],
      });
    },

    usersByGroup: async (_, { groupId }) => {
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

    usersByWorkshop: async (_, { workshopId }) => {
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

    seasonStudents: async () => {
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

      if (!isValid && userLevel == 'STUDENT') throw new Error('Кажется сезон еще не начался');

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
    createStudent: async (_, { russianName, groupId }) => {
      const group = await Group.findByPk(groupId);
      if (!group) throw new Error('Группы не существует');
      if (!group.seasonId) throw new Error('Группа не принадлежит сезону');
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

    createTeacher: async (_, { name }) => {
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

    registerStudent: async (_, { token, name, login, password, confirmPassword }) => {
      if (!login || !password) throw new Error('Введите пароль и логин');
      if (password !== confirmPassword) throw new Error('Пароли не совпадают');
      if (!name) throw new Error('Введите английское имя');

      const group = await Group.findByPk(token);
      if (!group) throw new Error('Группа не существует');

      const existingLogin = await User.findOne({ where: { login } });
      if (existingLogin) throw new Error('Логин уже занят');

      const hashedPassword = await bcrypt.hash(password, 10);

      const student = await User.create({
        login,
        seasonId: group.seasonId,
        name,
        lives: 3,
        coins: 0,
        hashedPassword,
        userLevel: 'STUDENT',
        isActive: true,
        groupId: group.id,
      });

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
    ) => {
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');

      user.name = name !== undefined ? name : user.name;
      user.russianName = russianName !== undefined ? russianName : user.russianName;
      user.groupId = groupId !== undefined ? groupId : user.groupId;
      user.houseId = houseId !== undefined ? houseId : user.houseId;
      user.englishLevel = englishLevel !== undefined ? englishLevel : user.englishLevel;
      user.classId = classId !== undefined ? classId : user.classId;
      user.coins = coins !== undefined ? coins : user.coins;
      user.englishLevel = englishLevel !== undefined ? englishLevel : user.englishLevel;

      await user.save();
      return user;
    },

    deleteUser: async (_, { id }) => {
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');

      if (user.userLevel === 'TEACHER' && user.groupId) {
        throw new Error('Cannot delete teacher with assigned group');
      }

      await user.destroy();
      return user;
    },

    transferCoins: async (_, { userId, recieverId, amount }) => {
      const user = await User.findByPk(userId);
      const reciever = await User.findByPk(recieverId);
      if (user.id === reciever.id) throw new Error('Нельзя переводить себе');
      if (!user) throw new Error('Отправитель не найден');
      if (!reciever) throw new Error('Получатель не найден');

      if (user.userLevel === 'STUDENT') {
        if (user.coins < amount) {
          throw new Error('Недостаточно Coins');
        } else {
          user.coins -= amount;
        }
      }

      reciever.coins += amount;
      await user.save();
      await reciever.save();
      return user;
    },

    addWorkshop: async (_, { id, workshopId }) => {
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');

      const workshop = await Workshop.findByPk(workshopId);
      if (!workshop) throw new Error('Workshop not found');

      await user.addWorkshop(workshop);
      return user;
    },
    fineUser: async (_, { id }) => {
      const user = await User.findByPk(id);
      const group = await Group.findOne({ where: { id: user.groupId } });

      if (!user.lives || user.lives === 0) {
        throw new Error('У студента не осталось жизней');
      }
      user.lives -= 1;

      user.save();
      group.save();

      return user;
    },
    uploadAvatar: async (_, { file, userId }) => {
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
  },
};
