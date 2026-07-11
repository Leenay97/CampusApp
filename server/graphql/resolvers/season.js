import {
  Group,
  Lesson,
  Season,
  User,
  Workshop,
  ArchivedSeason,
  ArchivedGroup,
  ArchivedWorkshop,
  ArchivedSporttime,
  sequelize,
} from '../../models/index.js';
import { requireAuth, requireAdmin } from '../auth.js';

export const seasonResolvers = {
  Query: {
    seasons: async (_, __, context) => {
      requireAdmin(context);
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
    season: async (_, { id }, context) => {
      requireAuth(context);
      return await Season.findByPk(id);
    },
    activeSeason: async (_, __, context) => {
      requireAuth(context);
      return await Season.findOne({
        where: { isActive: true },
        include: {
          model: Group,
          as: 'groups',
        },
      });
    },
    archivedSeasons: async (_, __, context) => {
      requireAdmin(context);
      return await ArchivedSeason.findAll({ order: [['createdAt', 'DESC']] });
    },
    archivedSeason: async (_, { id }, context) => {
      requireAdmin(context);
      return await ArchivedSeason.findByPk(id, {
        include: [
          { model: ArchivedGroup, as: 'groups' },
          { model: ArchivedWorkshop, as: 'workshops' },
          { model: ArchivedSporttime, as: 'sporttimes' },
        ],
      });
    },
  },

  ArchivedSeason: {
    lessonCounts: (parent) => parent.lessonCounts ?? [],
  },

  ArchivedGroup: {
    teachers: (parent) => parent.teachers ?? [],
    // Снимок хранит только id и имена; аватарки подтягиваем из живых User,
    // потому что аккаунты после архивации сезона не удаляются
    students: async (parent) => {
      const students = parent.students ?? [];
      if (!students.length) return [];

      const users = await User.findAll({
        where: { id: students.map((student) => student.id) },
        attributes: ['id', 'photoUrl'],
      });
      const photoById = new Map(users.map((user) => [user.id, user.photoUrl]));

      return students.map((student) => ({
        ...student,
        photoUrl: photoById.get(student.id) ?? null,
      }));
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
    createSeason: async (_, { number, year, startDate, endDate }, context) => {
      requireAdmin(context);
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

    updateSeason: async (_, { id, number, year }, context) => {
      requireAdmin(context);
      const season = await Season.findByPk(id);
      if (!season) throw new Error('Сезон не найден');

      season.number = number !== undefined ? number : season.number;
      season.year = year !== undefined ? year : season.year;

      await season.save();
      return season;
    },

    activateSeason: async (_, { id }, context) => {
      requireAdmin(context);
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

    archiveSeason: async (_, { id }, context) => {
      requireAdmin(context);
      const season = await Season.findByPk(id);
      if (!season) throw new Error('Сезон не найден');
      if (season.isArchived) throw new Error('Сезон уже архивирован');

      // Архивирование — много шагов; транзакция гарантирует «всё или ничего»,
      // чтобы сбой на середине не оставил полусозданный архив и несброшенных юзеров
      await sequelize.transaction(async (t) => {
        // Кол-во проведённых уроков английского по каждому учителю — просто цифры
        const lessons = await Lesson.findAll({
          where: { seasonId: id },
          include: [{ model: User, as: 'teacher' }],
          transaction: t,
        });
        const lessonCountByTeacher = new Map();
        for (const lesson of lessons) {
          const teacherName = lesson.teacher?.name ?? '—';
          lessonCountByTeacher.set(teacherName, (lessonCountByTeacher.get(teacherName) ?? 0) + 1);
        }

        // Снимок сезона в архив: составы групп, мастерские, спорттаймы и уроки
        const archivedSeason = await ArchivedSeason.create(
          {
            number: season.number,
            year: season.year,
            startDate: season.startDate,
            endDate: season.endDate,
            lessonCounts: [...lessonCountByTeacher].map(([name, count]) => ({ name, count })),
          },
          { transaction: t },
        );

        const groups = await Group.findAll({ where: { seasonId: id }, transaction: t });

        for (const group of groups) {
          const teachers =
            group.teacherIds && group.teacherIds.length > 0
              ? await User.findAll({
                  where: { id: group.teacherIds, userLevel: 'TEACHER' },
                  transaction: t,
                })
              : [];
          const students = await User.findAll({
            where: { groupId: group.id, userLevel: 'STUDENT' },
            transaction: t,
          });

          await ArchivedGroup.create(
            {
              archivedSeasonId: archivedSeason.id,
              name: group.name,
              teachers: teachers.map((teacher) => ({ id: teacher.id, name: teacher.name })),
              students: students.map((student) => ({
                id: student.id,
                name: student.name,
                russianName: student.russianName,
              })),
            },
            { transaction: t },
          );
        }

        const workshops = await Workshop.findAll({
          where: { seasonId: id },
          include: [{ model: User, as: 'teacher' }],
          transaction: t,
        });

        for (const workshop of workshops) {
          const archivedWorkshop = {
            archivedSeasonId: archivedSeason.id,
            name: workshop.name,
            date: workshop.date,
            teacher: workshop.teacher ? workshop.teacher.name : null,
          };

          if (workshop.type === 'SPORT') {
            await ArchivedSporttime.create(archivedWorkshop, { transaction: t });
          } else {
            await ArchivedWorkshop.create(archivedWorkshop, { transaction: t });
          }
        }

        // Сброс сезонных данных: аккаунты студентов остаются (имена, логин, пароль),
        // чтобы в следующем сезоне войти через «Уже есть аккаунт»
        await User.update(
          {
            seasonId: null,
            groupId: null,
            classId: null,
            houseId: null,
            coins: null,
            lives: null,
            votes: null,
            gotWorkshopCoins: null,
          },
          { where: { seasonId: id, userLevel: 'STUDENT' }, transaction: t },
        );

        await User.update(
          { seasonId: null, groupId: null },
          { where: { seasonId: id, userLevel: 'TEACHER' }, transaction: t },
        );

        season.isActive = false;
        season.isArchived = true;
        await season.save({ transaction: t });
      });

      return season;
    },

    deleteSeason: async (_, { id }, context) => {
      requireAdmin(context);
      const season = await Season.findByPk(id);
      if (!season) throw new Error('Сезон не найден');
      if (season.isActive) throw new Error('Нельзя удалить активный сезон — сначала архивируйте');

      await season.destroy();
      return season;
    },
  },
};
