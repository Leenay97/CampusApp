import { User, Workshop, Group } from '../../models/index.js';

export const userResolvers = {
  Query: {
    students: async () => {
      return await User.findAll({
        where: { userLevel: 'STUDENT' },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'workshops' },
        ],
      });
    },
    teachers: async () => {
      return await User.findAll({
        where: { userLevel: 'TEACHER' },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'workshops' },
        ],
      });
    },
    user: async (_, { id }) => {
      return await User.findByPk(id, {
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'workshops' },
        ],
      });
    },

    // Новый: по groupId
    usersByGroup: async (_, { groupId }) => {
      return await User.findAll({
        where: { groupId },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'workshops' },
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
          { model: Workshop, as: 'workshops' },
        ],
      });
    },
  },

  Mutation: {
    createStudent: async (_, { name, russianName, groupId }) => {
      const user = await User.create({
        name,
        russianName,
        groupId,
        coins: 0,
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

    transferCoins: async (_, { id, amount }) => {
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');

      user.coins += amount;
      await user.save();
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
  },
};
