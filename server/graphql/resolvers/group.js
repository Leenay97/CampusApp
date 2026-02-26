import { User, Workshop, Group } from '../../models/index.js';

export const groupResolvers = {
  Query: {
    groups: async () => {
      return await Group.findAll();
    },
    group: async (_, { id }) => {
      return await Group.findByPk(id, {
        include: [{ model: User, as: 'users' }],
      });
    },

    // Новый: по groupId
    groupByUserId: async (_, { userId }) => {
      return await Group.findOne({
        where: { userId },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'workshops' },
        ],
      });
    },

    // Новый: по workshopId
    groupByUserId: async (_, { userId }) => {
      return await Group.findOne({
        where: { userId },
        include: [{ model: User, as: 'users' }],
      });
    },
  },
  Mutation: {
    createGroup: async (_, { name, userIds }) => {
      // 1. Проверка — максимум 2 учителя

      console.log(userIds);
      const validUserIds = userIds ? userIds.filter((id) => id != null) : [];

      if (validUserIds.length < 2) {
        throw new Error('At least two teachers must be selected');
      }

      const existingGroup = await Group.findOne({
        where: {
          name,
        },
      });

      if (existingGroup) throw new Error('Group exists');

      if (userIds && userIds.length > 3) {
        throw new Error('Maximum 3 teachers per group');
      }

      const users = await User.findAll({
        where: {
          id: userIds,
        },
      });

      if (users.length !== userIds.length) {
        throw new Error('Some users not found');
      }

      const usersWithGroup = users.filter((user) => user.groupId !== null);
      if (usersWithGroup.length > 0) {
        const userNames = usersWithGroup.map((u) => u.name || u.id).join(', ');
        throw new Error(`Users already have a group: ${userNames}`);
      }

      const group = await Group.create({ name, points: 0 });

      // 3. Привязываем учителей к группе
      if (userIds && userIds.length > 0) {
        await User.update(
          { groupId: group.id },
          {
            where: {
              id: userIds, // Sequelize автоматически обработает массив как IN условие
            },
          },
        );
      }

      // 4. Возвращаем группу с пользователями
      return await Group.findByPk(group.id, {
        include: [{ model: User, as: 'users' }],
      });
    },

    addPoints: async (_, { id, amount }) => {
      const group = await Group.findByPk(id);
      if (!group) throw new Error('Group not found');

      group.points += amount;
      await group.save();
      return group;
    },

    deleteGroup: async (_, { id }) => {
      const group = await Group.findByPk(id);
      if (!group) throw new Error('Group not found');

      await group.destroy();
      return group;
    },
  },
};
