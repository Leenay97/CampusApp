import { Op } from 'sequelize';
import { Place, Season, TechnicalData, User, Workshop, sequelize } from '../../models/index.js';

const UserWorkshop = sequelize.models.UserWorkshop;

export const workshopResolvers = {
  Query: {
    workshops: async (_, { isSport }) => {
      return await Workshop.findAll({
        where: {
          type: isSport === true ? 'SPORT' : 'WORKSHOP',
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
    todayWorkshops: async (_, { isSport }) => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      return await Workshop.findAll({
        where: {
          date: {
            [Op.between]: [startOfDay, endOfDay],
          },
          type: isSport ? 'SPORT' : 'WORKSHOP',
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
      { name, description, placeId, teacherId, maxStudents, maxAge, type, date },
    ) => {
      if (!name) throw new Error('Нет названия');
      if (!teacherId) throw new Error('Не выбран учитель');
      if (!placeId) throw new Error('Не выбрано место');
      if (!maxStudents) throw new Error('Не выбрано кол-во студентов');
      if (!type) throw new Error('Ошибка типа');
      if (!date) throw new Error('Нет даты');

      const activeSeason = await Season.findOne({ where: { isActive: true } });

      const workshop = await Workshop.create({
        name,
        description: description || '',
        placeId,
        teacherId,
        maxStudents,
        seasonId: activeSeason?.id,
        maxAge: maxAge || 0,
        type,
        date,
      });
      return workshop;
    },

    joinWorkshop: async (_, { studentId, workshopId, isSport }) => {
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

        const existingEntry = await UserWorkshop.findOne({
          where: { userId: studentId, workshopId },
        });

        if (existingEntry) {
          await existingEntry.destroy();
        } else {
          // получаем все воркшопы того же типа
          const workshopsOfSameType = await Workshop.findAll({
            where: { type: workshop.type },
            attributes: ['id'],
          });

          const workshopIds = workshopsOfSameType.map((w) => w.id);

          // удаляем записи только этого типа
          await UserWorkshop.destroy({
            where: {
              userId: studentId,
              workshopId: workshopIds,
            },
          });

          await UserWorkshop.create({
            userId: studentId,
            workshopId,
          });
        }

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

        throw new Error(error.message);
      }
    },

    closeWorkshop: async (_, { studentIds, workshopId }) => {
      const workshop = await Workshop.findByPk(workshopId);
      if (!workshop) throw new Error('Workshop not found');

      const techData = await TechnicalData.findOne();

      const coinsValue =
        workshop.type === 'WORKSHOP' ? techData.workshopValue : techData.sportTimeValue;

      const students = await User.findAll({ where: { id: studentIds } });

      await Promise.all(
        students.map((student) => {
          student.coins += coinsValue;
          return student.save();
        }),
      );

      workshop.isClosed = true;
      await workshop.save();
      return workshop;
    },
  },
};
