import path from 'path';
import fs from 'fs';
import { Op } from 'sequelize';
import { Place, Season, TechnicalData, User, Workshop, sequelize } from '../../models/index.js';
import { requireAuth, requireStaff, requireSelfOrStaff } from '../auth.js';
import { logCoinTransaction } from './coinTransaction.js';

const UserWorkshop = sequelize.models.UserWorkshop;

function deleteWorkshopImageFile(url) {
  if (!url) return;
  const filePath = path.join(process.cwd(), 'uploads', 'workshops', path.basename(url));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

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
        where: { teacherId: userId, type: 'WORKSHOP' },
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
      { name, description, placeId, teacherId, maxStudents, maxAge, type, date, image },
      context,
    ) => {
      requireStaff(context);
      if (!name) throw new Error('Нет названия');
      if (!teacherId) throw new Error('Не выбран учитель');
      if (!placeId) throw new Error('Не выбрано место');
      if (!type) throw new Error('Ошибка типа');
      // Sport Time — без самозаписи, поэтому без ограничения по вместимости
      if (type !== 'SPORT' && !maxStudents) throw new Error('Не выбрано кол-во студентов');
      if (!date) throw new Error('Нет даты');

      const activeSeason = await Season.findOne({ where: { isActive: true } });

      const workshop = await Workshop.create({
        name,
        description: description || '',
        placeId,
        teacherId,
        maxStudents: type === 'SPORT' ? null : maxStudents,
        seasonId: activeSeason?.id,
        maxAge: maxAge || 0,
        type,
        date,
        image: image || null,
      });
      return workshop;
    },

    updateWorkshop: async (
      _,
      { id, name, description, placeId, teacherId, maxStudents, maxAge, date, image },
      context,
    ) => {
      requireStaff(context);
      const workshop = await Workshop.findByPk(id);
      if (!workshop) throw new Error('Мастеркласс не найден');

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (placeId !== undefined) updates.placeId = placeId;
      if (teacherId !== undefined) updates.teacherId = teacherId;
      if (maxStudents !== undefined) updates.maxStudents = maxStudents;
      if (maxAge !== undefined) updates.maxAge = maxAge;
      if (date !== undefined) updates.date = date;
      if (image !== undefined) {
        if (workshop.image && workshop.image !== image) {
          deleteWorkshopImageFile(workshop.image);
        }
        updates.image = image;
      }

      await workshop.update(updates);

      return await Workshop.findByPk(id, {
        include: [
          { model: User, as: 'teacher' },
          {
            model: User,
            as: 'students',
            through: { model: UserWorkshop },
            attributes: ['id', 'name'],
          },
          { model: Place, as: 'place', attributes: ['id', 'name'] },
        ],
      });
    },

    uploadWorkshopImage: async (_, { file }, context) => {
      requireStaff(context);

      // graphql-upload-minimal может отдать файл в разных обёртках (см. uploadAvatar)
      let uploadData;
      if (file.file && file.file.createReadStream) {
        uploadData = file.file;
      } else if (file.promise && typeof file.promise.then === 'function') {
        uploadData = await file.promise;
      } else if (file.createReadStream) {
        uploadData = file;
      } else {
        throw new Error('Invalid file upload object');
      }

      const { createReadStream, mimetype } = uploadData;

      const extByMime = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
      const ext = extByMime[mimetype];
      if (!ext) throw new Error('Only JPEG, PNG, WEBP images are allowed');

      const uploadDir = path.join(process.cwd(), 'uploads', 'workshops');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      await new Promise((resolve, reject) => {
        const stream = createReadStream();
        const outStream = fs.createWriteStream(filePath);
        stream.pipe(outStream);
        stream.on('error', reject);
        outStream.on('finish', resolve);
      });

      return `/uploads/workshops/${uniqueName}`;
    },

    // Чистка картинок, загруженных в модалке, но не попавших в итоге в мастеркласс
    deleteWorkshopImage: async (_, { url }, context) => {
      requireStaff(context);
      if (!/^\/uploads\/workshops\/[\w.-]+$/.test(url)) {
        throw new Error('Некорректный url картинки');
      }
      deleteWorkshopImageFile(url);
      return true;
    },

    joinWorkshop: async (_, { studentId, workshopId }, context) => {
      // Студент записывает только себя; персонал может записать любого
      requireSelfOrStaff(context, studentId);
      try {
        return await sequelize.transaction(async (transaction) => {
          const student = await User.findByPk(studentId, { transaction });

          if (!student) {
            throw new Error('Студент не найден');
          }

          if (student.userLevel !== 'STUDENT') {
            throw new Error('Записаться может только студент');
          }

          const workshop = await Workshop.findByPk(workshopId, { transaction });

          if (!workshop) {
            throw new Error('MK не найден');
          }

          if (workshop.type === 'SPORT') {
            throw new Error('Запись на Sport Time закрыта');
          }

          // Список на фронте уже отфильтрован по isClosed, но мутацию можно
          // вызвать напрямую с id закрытого или вчерашнего мастер-класса.
          if (workshop.isClosed) {
            throw new Error('Мастеркласс уже закрыт');
          }

          // Кнопка работает как переключатель, поэтому намерение (записаться или
          // отменить) определяем по состоянию ДО блокировок — по тому самому,
          // которое пользователь видел на экране. Если прочитать запись уже под
          // блокировкой, то при двойном клике второй запрос увидит результат
          // первого и снимет запись, хотя пользователь хотел записаться.
          const existingEntry = await UserWorkshop.findOne({
            where: { userId: studentId, workshopId },
            transaction,
          });

          if (existingEntry) {
            // Отмена записи: мест не занимает, блокировки не нужны.
            await UserWorkshop.destroy({
              where: { userId: studentId, workshopId },
              transaction,
            });
          } else {
            // Блокировка студента, затем мастер-класса — тот же порядок, что в
            // closeWorkshop, иначе встречные мутации могут заблокировать друг друга.
            // Блокировка студента не даёт записать его в два МК одновременно.
            await User.findByPk(studentId, { transaction, lock: transaction.LOCK.UPDATE });

            const lockedWorkshop = await Workshop.findByPk(workshopId, {
              transaction,
              lock: transaction.LOCK.UPDATE,
            });

            // Считаем из БД под блокировкой: без неё параллельные запросы читают
            // одно и то же число свободных мест и записываются сверх лимита.
            const studentsCount = await UserWorkshop.count({
              where: { workshopId },
              transaction,
            });

            if (studentsCount >= lockedWorkshop.maxStudents) {
              throw new Error('Мест нет');
            }

            // получаем все воркшопы того же типа
            const workshopsOfSameType = await Workshop.findAll({
              where: { type: workshop.type },
              attributes: ['id'],
              transaction,
            });

            const workshopIds = workshopsOfSameType.map((w) => w.id);

            // удаляем записи только этого типа
            await UserWorkshop.destroy({
              where: {
                userId: studentId,
                workshopId: workshopIds,
              },
              transaction,
            });

            await UserWorkshop.create({ userId: studentId, workshopId }, { transaction });
          }

          return await Workshop.findByPk(workshopId, {
            include: [
              {
                model: User,
                as: 'students',
                through: { attributes: [] },
              },
            ],
            transaction,
          });
        });
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new Error('Вы уже записаны на этот мастеркласс');
        }

        throw new Error(error.message);
      }
    },

    closeWorkshop: async (_, { studentIds, workshopId }, context) => {
      requireStaff(context);

      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate(),
      ).padStart(2, '0')}`;

      // Начисление и закрытие одной транзакцией: без блокировки строк студентов
      // начисление читает баланс до параллельного перевода и затирает его,
      // а упавшая запись истории оставляет монеты без следа в CoinTransaction.
      const { workshop, awardedStudentIds, coinsValue } = await sequelize.transaction(async (t) => {
        // Порядок блокировки везде одинаковый: сначала строки User (по id),
        // потом ресурс. Иначе возможен дедлок со встречными мутациями.
        const students = studentIds?.length
          ? await User.findAll({
              where: { id: studentIds },
              order: [['id', 'ASC']],
              transaction: t,
              lock: t.LOCK.UPDATE,
            })
          : [];

        const workshop = await Workshop.findByPk(workshopId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!workshop) throw new Error('Workshop not found');

        // Sport Time закрывается автоматически по расписанию, без начисления коинов
        if (workshop.type === 'SPORT') {
          throw new Error('Sport Time закрывается автоматически');
        }

        const techData = await TechnicalData.findOne({ transaction: t });

        const coinsValue = techData.workshopValue;
        const coinsDateField = 'workshopCoinsDate';

        const awardedStudentIds = [];

        // Последовательно, а не Promise.all: у транзакции одно соединение,
        // параллельные запросы по нему выполнять нельзя.
        for (const student of students) {
          // Коины за каждый тип активности начисляются не чаще раза в день
          if (student[coinsDateField] === today) continue;

          student.coins += coinsValue;
          student[coinsDateField] = today;
          await student.save({ transaction: t });
          awardedStudentIds.push(student.id);
          await logCoinTransaction(
            { studentId: student.id, amount: coinsValue, reason: 'workshop' },
            t,
          );
        }

        workshop.isClosed = true;
        await workshop.save({ transaction: t });

        return { workshop, awardedStudentIds, coinsValue };
      });

      const notificationTitle = 'Отличная работа!';
      const notificationUrl = '/workshops';

      // Пуши уходят после коммита и в фоне, ответ мутации их не ждёт
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

      return workshop;
    },
  },
};
