import { Op } from 'sequelize';
import { Place, Season, User, Workshop, sequelize } from '../../models/index.js';

const UserWorkshop = sequelize.models.UserWorkshop;

export const workshopResolvers = {
  Query: {
    workshops: async () => {
      return await Workshop.findAll({
        include: [
          { model: User, as: 'teacher' }, // учитель
        ],
      });
    },
    todayWorkshops: async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      return await Workshop.findAll({
        where: {
          date: {
            [Op.between]: [startOfDay, endOfDay],
          },
          isClosed: false,
        },
        include: [
          { model: User, as: 'teacher' },
          {
            model: User,
            as: 'students',
            through: {
              model: UserWorkshop,
            },
            attributes: ['id', 'name'],
          },
          {
            model: Place,
            as: 'place',
            attributes: ['id', 'name'],
          },
        ],
      });
    },
    workshopsByTeacher: async (_, { userId }) => {
      return await Workshop.findAll({
        where: { teacherId: userId },
        include: [
          { model: User, as: 'teacher' },
          {
            model: User,
            as: 'students',
            attributes: ['id', 'name'],
          },
        ],
      });
    },
    // workshop: async (_, { id }) => {
    //   return await Workshop.findByPk(id, {
    //     include: [{ model: Workshop, as: 'workshops' }],
    //   });
    // },

    // workshopsByUser: async (_, { userId }) => {
    //   // Сначала находим пользователя, затем воркшоп
    //   const user = await User.findByPk(userId);
    //   if (!user) return [];
    //   return await Workshop.findAll({
    //     where: { id: user.workshopId },
    //     include: [{ model: Workshop, as: 'workshops' }],
    //   });
    // },
  },

  Mutation: {
    createWorkshop: async (
      _,
      { name, description, placeId, teacherId, maxStudents, maxAge, type },
    ) => {
      if (!name) throw new Error('Нет названия');
      if (!teacherId) throw new Error('Не выбран учитель');
      if (!placeId) throw new Error('Не выбрано место');
      if (!maxStudents) throw new Error('Не выбрано кол-во студентов');
      if (!type) throw new Error('Ошибка типа');

      const activeSeason = await Season.findOne({ where: { isActive: true } });

      const workshop = await Workshop.create({
        name,
        description: description || '',
        placeId,
        teacherId,
        maxStudents,
        seasonId: activeSeason?.id,
        maxAge: maxAge || 100,
        type,
        date: Date.now(),
      });
      return workshop;
    },

    joinWorkshop: async (_, { studentId, workshopId }) => {
      try {
        const [student, workshop] = await Promise.all([
          User.findByPk(studentId),
          Workshop.findByPk(workshopId, {
            include: [
              {
                model: User,
                as: 'students',
                through: { attributes: [] },
              },
            ],
          }),
        ]);

        if (!student) {
          throw new Error('Студент не найден');
        }

        if (student.userLevel !== 'STUDENT') {
          throw new Error('Записаться может только студент');
        }

        if (!workshop) {
          throw new Error('MK не найден');
        }

        // Проверяем, не записан ли уже студент
        const existingEntry = await UserWorkshop.findOne({
          where: {
            userId: studentId,
            workshopId: workshopId,
          },
        });

        if (existingEntry) {
          throw new Error('Вы уже записаны на этот мастеркласс');
        }

        // Создаем запись в through-таблице
        await UserWorkshop.create({
          userId: studentId,
          workshopId: workshopId,
        });

        // Получаем обновленный workshop со студентами
        const updatedWorkshop = await Workshop.findByPk(workshopId, {
          include: [
            {
              model: User,
              as: 'students',
              through: { attributes: [] },
            },
          ],
        });

        return updatedWorkshop;
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new Error('Вы уже записаны на этот мастеркласс');
        }

        throw new Error(`${error.message}`);
      }
    },

    closeWorkshop: async (_, { id }) => {
      const workshop = await Workshop.findByPk(id);
      if (!workshop) throw new Error('Workshop not found');

      workshop.isClosed = true;
      await workshop.save();
      return workshop;
    },
  },
};
