import { User, Group } from '../../models/index.js';
import { requireAuth, requireStaff, requireAdmin } from '../auth.js';

export const groupResolvers = {
  Query: {
    groups: async (_, __, context) => {
      requireAuth(context);
      return await Group.findAll();
    },

    seasonGroups: async (_, { seasonId }, context) => {
      requireAuth(context);
      return await Group.findAll({
        where: { seasonId },
      });
    },

    group: async (_, { id }, context) => {
      requireAuth(context);
      return await Group.findByPk(id, {
        include: [{ model: User, as: 'users' }],
      });
    },
  },

  Group: {
    // 👈 Ключевой момент: резолвер для поля teachers
    teachers: async (parent) => {
      const group = await Group.findByPk(parent.id, {
        include: [
          {
            model: User,
            as: 'users', // Используем существующий алиас 'users'
            where: { userLevel: 'TEACHER' },
            required: false,
          },
        ],
      });
      return group?.users || [];
    },

    // Если нужно поле students
    students: async (parent) => {
      const group = await Group.findByPk(parent.id, {
        include: [
          {
            model: User,
            as: 'users',
            where: { userLevel: 'STUDENT' },
            required: false,
          },
        ],
      });
      return group?.users || [];
    },
  },

  Mutation: {
    createGroup: async (_, { name, userIds, seasonId }, context) => {
      requireAdmin(context);
      const validUserIds = userIds ? userIds.filter((id) => id != null) : [];

      if (validUserIds.length < 2) {
        throw new Error('Минимум 2 учителя');
      }

      const existingGroup = await Group.findOne({
        where: {
          name,
          seasonId,
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

      const group = await Group.create({ name, points: 0, seasonId, teacherIds: userIds });

      return await Group.findByPk(group.id, {
        include: [{ model: User, as: 'users' }],
      });
    },

    updateGroup: async (_, { id, amount, rubbersAmount, places, name, teacherIds }, context) => {
      requireStaff(context);
      console.log('teacherIds:', teacherIds);
      const group = await Group.findByPk(id);
      if (!group) throw new Error('Группа не найдена');

      if (name) {
        group.name = name;
      }

      if (places !== undefined) {
        group.places = places;
      }

      if (amount !== undefined && amount !== null) {
        group.points += amount;
      }

      if (rubbersAmount !== undefined && rubbersAmount !== null) {
        group.rubbers = Math.max(0, (group.rubbers ?? 0) + rubbersAmount);
      }

      if (teacherIds && Array.isArray(teacherIds)) {
        // User.groupId здесь не трогаем: группы редактируются только у ещё не
        // запущенного сезона, а учителям groupId проставляет activateSeason.
        group.teacherIds = teacherIds;
      }

      await group.save();

      return group;
    },

    deleteGroup: async (_, { id }, context) => {
      requireAdmin(context);
      const group = await Group.findByPk(id);
      if (!group) throw new Error('Группа не найдена');

      // Иначе студенты/учителя этой группы тихо остаются без groupId
      const membersCount = await User.count({ where: { groupId: id } });
      if (membersCount > 0) {
        throw new Error('Нельзя удалить группу: в ней ещё есть студенты или учителя');
      }

      await group.destroy();
      return group;
    },
  },
};
