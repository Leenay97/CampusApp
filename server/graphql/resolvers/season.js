import { Group, Season, User } from '../../models/index.js';

export const seasonResolvers = {
  Query: {
    seasons: async () => {
      return await Season.findAll();
    },
    season: async (_, { id }) => {
      return await Season.findByPk(id);
    },
  },

  Mutation: {
    createSeason: async (_, { number, year, groupTeachers }) => {
      const existingSeason = await Season.findOne({ where: { number, year } });
      if (existingSeason) {
        throw new Error('Сезон уже существует');
      }

      const season = await Season.create({ number, year });

      for (const groupData of groupTeachers) {
        await Group.create({
          name: groupData.name,
          seasonId: season.id,
          teacherIds: groupData.teacherIds,
        });
      }

      return season;
    },

    updateSeason: async (_, { id, number, year }) => {
      const season = await Season.findByPk(id);
      if (!d) throw new Error('Сезон не найден');

      season.number = number !== undefined ? number : season.number;
      season.year = year !== undefined ? year : season.year;

      await season.save();
      return season;
    },

    activateSeason: async (_, { id }) => {
      const season = await Season.findByPk(id, {
        include: {
          model: Group,
          as: 'groups',
          include: {
            model: User,
            as: 'users',
            where: { userLevel: 'TEACHER' },
            required: false,
          },
        },
      });
      if (!season) throw new Error('Сезон не найден');
      if (season.isActive) throw new Error('Сезон уже активен');

      const deactivateSeasons = await Season.findAll({ where: { isActive: true } });
      for (const s of deactivateSeasons) {
        s.isActive = false;
        s.isArchived = true;
        await s.save();
      }

      season.isActive = true;
      await season.save();

      const groups = await Group.findAll({ where: { seasonId: id } });

      for (const group of groups) {
        const teacherIds = group.teacherIds;

        if (teacherIds.length > 0) {
          await User.update(
            { seasonId: season.id, groupId: group.id },
            { where: { id: teacherIds, userLevel: 'TEACHER' } },
          );
        }
      }

      return season;
    },

    deleteSeason: async (_, { id }) => {
      const season = await Season.findByPk(id);
      if (!season) throw new Error('Сезон не найден');

      await season.destroy();
      return season;
    },
  },
};
