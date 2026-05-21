import { Group, Season, User } from '../../models/index.js';

export const seasonResolvers = {
  Query: {
    seasons: async () => {
      const seasons = await Season.findAll({
        include: [
          {
            model: Group,
            as: 'groups',
          },
        ],
      });
      return seasons;
    },
    season: async (_, { id }) => {
      return await Season.findByPk(id);
    },
    activeSeason: async () => {
      return await Season.findOne({
        where: { isActive: true },
        include: {
          model: Group,
          as: 'groups',
        },
      });
    },
  },

  Group: {
    teachers: async (parent) => {
      if (!parent.teacherIds || parent.teacherIds.length === 0) {
        return [];
      }

      const teachers = await User.findAll({
        where: {
          id: parent.teacherIds,
          userLevel: 'TEACHER',
        },
      });

      return teachers;
    },
  },

  Mutation: {
    createSeason: async (_, { number, year, startDate, endDate }) => {
      const existingSeason = await Season.findOne({ where: { number, year } });
      if (existingSeason) {
        throw new Error('Сезон уже существует');
      }
      if (!number || !year || !startDate || !endDate) {
        throw new Error('Все поля обязательны для заполнения');
      }

      const season = await Season.create({ number, year, startDate, endDate });

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
      const season = await Season.findByPk(id);
      if (!season) throw new Error('Сезон не найден');
      if (season.isActive) throw new Error('Сезон уже активен');

      const isSomeSeasonActive = await Season.findOne({ where: { isActive: true } });
      if (isSomeSeasonActive) throw new Error('Существует активный сезон');

      season.isActive = true;
      await season.save();

      const groups = await Group.findAll({ where: { seasonId: id } });

      for (const group of groups) {
        const teacherIds = group.teacherIds;

        if (teacherIds && teacherIds.length > 0) {
          await User.update(
            { seasonId: season.id, groupId: group.id },
            { where: { id: teacherIds, userLevel: 'TEACHER' } },
          );
        }
        console.log({
          groupId: group.id,
          teacherIds,
        });
      }

      return season;
    },

    archiveSeason: async (_, { id }) => {
      const season = await Season.findByPk(id);
      if (!season) throw new Error('Сезон не найден');
      if (season.isArchived) throw new Error('Сезон уже архивирован');

      season.isActive = false;
      season.isArchived = true;
      await season.save();

      const groups = await Group.findAll({ where: { seasonId: id } });

      for (const group of groups) {
        const teacherIds = group.teacherIds;

        if (teacherIds && teacherIds.length > 0) {
          await User.update(
            { seasonId: null, groupId: null },
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
