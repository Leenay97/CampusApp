import { User, Workshop, Group, Season } from '../../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { use } from 'react';

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

    // Новый: по groupId
    usersByGroup: async (_, { groupId }) => {
      return await User.findAll({
        where: { groupId },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'attendingWorkshops' },
        ],
      });
    },

    // Новый: по workshopId
    usersByWorkshop: async (_, { workshopId }) => {
      // Сначала находим воркшоп, затем пользователя
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
        name,
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

    updateUser: async (_, { id, name, russianName, groupId }) => {
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');

      user.name = name !== undefined ? name : user.name;
      user.russianName = russianName !== undefined ? russianName : user.russianName;
      user.groupId = groupId !== undefined ? groupId : user.groupId;

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

      if (user.lives === 0) {
        throw new Error('У студента не осталось жизней');
      }
      user.lives -= 1;
      group.points -= 199;

      user.save();
      group.save();

      return user;
    },
  },
};
