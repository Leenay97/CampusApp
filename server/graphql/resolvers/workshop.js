import { Op } from 'sequelize';
import { Place, Season, TechnicalData, User, Workshop, sequelize } from '../../models/index.js';
import { requireAuth, requireStaff, requireSelfOrStaff } from '../auth.js';
import { logCoinTransaction } from './coinTransaction.js';

const UserWorkshop = sequelize.models.UserWorkshop;

export const workshopResolvers = {
  Query: {
    workshops: async (_, { isSport }, context) => {
      requireAuth(context);
      const activeSeason = await Season.findOne({ where: { isActive: true } });
      if (!activeSeason) return [];

      return await Workshop.findAll({
        where: {
          type: isSport === true ? 'SPORT' : 'WORKSHOP',
          seasonId: activeSeason.id,
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
    todayWorkshops: async (_, { isSport }, context) => {
      requireAuth(context);
      // Список открывается не раньше времени, указанного в тех. данных
      const techData = await TechnicalData.findOne();
      const startTime = isSport ? techData?.sportTimeStart : techData?.workshopStart;

      if (startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const opensAt = new Date();
        opensAt.setHours(hours, minutes || 0, 0, 0);
        if (new Date() < opensAt) return [];
      }

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
    workshopsByTeacher: async (_, { userId }, context) => {
      requireAuth(context);
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
  },

  Mutation: {
    createWorkshop: async (
      _,
      { name, description, placeId, teacherId, maxStudents, maxAge, type, date },
      context,
    ) => {
      requireStaff(context);
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

    joinWorkshop: async (_, { studentId, workshopId }, context) => {
      // Студент записывает только себя; персонал может записать любого
      requireSelfOrStaff(context, studentId);
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

    closeWorkshop: async (_, { studentIds, workshopId }, context) => {
      requireStaff(context);
      const workshop = await Workshop.findByPk(workshopId);
      if (!workshop) throw new Error('Workshop not found');

      const techData = await TechnicalData.findOne();

      const isSport = workshop.type === 'SPORT';
      const coinsValue = isSport ? techData.sportTimeValue : techData.workshopValue;
      const coinsDateField = isSport ? 'sportCoinsDate' : 'workshopCoinsDate';

      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate(),
      ).padStart(2, '0')}`;

      const students = await User.findAll({ where: { id: studentIds } });

      const awardedStudentIds = [];

      await Promise.all(
        students.map(async (student) => {
          // Коины за каждый тип активности начисляются не чаще раза в день
          if (student[coinsDateField] === today) return null;

          student.coins += coinsValue;
          student[coinsDateField] = today;
          await student.save();
          awardedStudentIds.push(student.id);
          return logCoinTransaction({
            studentId: student.id,
            amount: coinsValue,
            reason: isSport ? 'sport' : 'workshop',
          });
        }),
      );

      const notificationTitle = isSport ? '+10 к силе' : 'Отличная работа!';
      const notificationUrl = isSport ? '/sporttime' : '/workshops';

      // Пуши уходят в фоне, ответ мутации их не ждёт
      Promise.allSettled(
        awardedStudentIds.map((studentId) =>
          context.sendPushNotification(
            studentId,
            notificationTitle,
            `+${coinsValue} coins`,
            notificationUrl,
          ),
        ),
      );

      workshop.isClosed = true;
      await workshop.save();
      return workshop;
    },
  },
};
