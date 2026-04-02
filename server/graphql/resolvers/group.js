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

    groupByUserId: async (_, { userId }) => {
      return await Group.findOne({
        where: { userId },
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'workshops' },
        ],
      });
    },

    groupByUserId: async (_, { userId }) => {
      return await Group.findOne({
        where: { userId },
        include: [{ model: User, as: 'users' }],
      });
    },
  },
  Mutation: {
    createGroup: async (_, { name, userIds }) => {
      const validUserIds = userIds ? userIds.filter((id) => id != null) : [];

      if (validUserIds.length < 2) {
        throw new Error('Минимум 2 учителя');
      }

      const existingGroup = await Group.findOne({
        where: {
          name,
        },
      });

      if (existingGroup) throw new Error('Группа уже существует');

      if (userIds && userIds.length > 3) {
        throw new Error('Максисум 3 учителя');
      }

      const users = await User.findAll({
        where: {
          id: userIds,
        },
      });

      if (users.length !== userIds.length) {
        throw new Error('Учителя не найдены');
      }

      const usersWithGroup = users.filter((user) => user.groupId !== null);
      if (usersWithGroup.length > 0) {
        const userNames = usersWithGroup.map((u) => u.name || u.id).join(', ');
        throw new Error(`У учителя уже есть группа: ${userNames}`);
      }

      const group = await Group.create({ name, points: 0 });

      if (userIds && userIds.length > 0) {
        await User.update(
          { groupId: group.id },
          {
            where: {
              id: userIds,
            },
          },
        );
      }

      return await Group.findByPk(group.id, {
        include: [{ model: User, as: 'users' }],
      });
    },

    updateGroup: async (_, { id, amount, places }) => {
      const group = await Group.findByPk(id);
      if (!group) throw new Error('Группа не найдена');

      group.points += amount;
      group.places = places;
      await group.save();
      return group;
    },

    deleteGroup: async (_, { id }) => {
      const group = await Group.findByPk(id);
      if (!group) throw new Error('Группа не найдена');

      await group.destroy();
      return group;
    },
  },
};
