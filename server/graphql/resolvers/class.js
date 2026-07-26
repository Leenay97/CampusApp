import { Op } from 'sequelize';
import {
  Class,
  Group,
  Lesson,
  Place,
  Season,
  TechnicalData,
  User,
  sequelize,
} from '../../models/index.js';
import { requireAuth, requireStaff, requireAdmin } from '../auth.js';
import { logCoinTransaction } from './coinTransaction.js';

const classInclude = [
  { model: Place, as: 'place' },
  { model: User, as: 'teachers' },
  { model: User, as: 'students', include: [{ model: Group, as: 'group' }] },
];

// На сколько дней назад можно закрыть пропущенный урок
const MAX_BACKDATE_DAYS = 15;

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function todayDate() {
  return formatDate(new Date());
}

// Дата приходит с клиента строкой: без проверки формата она уходит в DATEONLY
// и роняет запрос ошибкой Postgres
function normalizeDate(date) {
  if (!date) return todayDate();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Некорректная дата урока');

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime()) || formatDate(parsed) !== date) {
    throw new Error('Некорректная дата урока');
  }
  return date;
}

function earliestCloseDate() {
  const earliest = new Date();
  earliest.setHours(0, 0, 0, 0);
  earliest.setDate(earliest.getDate() - MAX_BACKDATE_DAYS);
  return formatDate(earliest);
}

// Границы обязательны: будущей датой учитель начислил бы coins вперёд, а без
// нижней — сразу за любое число пропущенных дней.
// Строки YYYY-MM-DD сравниваются лексикографически как даты.
function resolveCloseDate(date) {
  const closeDate = normalizeDate(date);
  if (closeDate > todayDate()) throw new Error('Нельзя закрыть урок будущей датой');
  if (closeDate < earliestCloseDate()) {
    throw new Error(`Урок можно закрыть задним числом не старше ${MAX_BACKDATE_DAYS} дней`);
  }

  return closeDate;
}

export const classResolvers = {
  Query: {
    classes: async (_, __, context) => {
      requireAuth(context);
      const activeSeason = await Season.findOne({ where: { isActive: true } });
      if (!activeSeason) return [];

      return await Class.findAll({
        where: { seasonId: activeSeason.id },
        include: classInclude,
      });
    },
    class: async (_, { id }, context) => {
      requireAuth(context);
      return await Class.findByPk(id, { include: classInclude });
    },
    classByUserId: async (_, { userId }, context) => {
      requireAuth(context);
      const user = await User.findByPk(userId);
      if (!user) throw new Error('Пользователь не найден');

      if (user.userLevel === 'STUDENT') {
        return await Class.findOne({
          where: { id: user.classId },
          include: classInclude,
        });
      }

      if (user.userLevel === 'TEACHER') {
        const classes = await user.getTaughtClasses({ include: classInclude });
        return classes[0] || null;
      }

      return null;
    },
    classesByTeacher: async (_, { teacherId }, context) => {
      requireAuth(context);
      const teacher = await User.findByPk(teacherId);
      if (!teacher) throw new Error('Учитель не найден');

      const activeSeason = await Season.findOne({ where: { isActive: true } });
      if (!activeSeason) return [];

      return await teacher.getTaughtClasses({
        where: { seasonId: activeSeason.id },
        include: classInclude,
      });
    },
  },

  Class: {
    // Даты проведённых уроков в окне закрытия задним числом. Одного поля хватает
    // и на статус «закрыт сегодня», и на список ещё не закрытых прошлых дней.
    closedDates: async (parent) => {
      const lessons = await Lesson.findAll({
        where: { classId: parent.id, date: { [Op.gte]: earliestCloseDate() } },
        order: [['date', 'DESC']],
      });
      return lessons.map((lesson) => lesson.date);
    },
  },

  Mutation: {
    createClass: async (_, { name, teacherIds, studentIds, placeId }, context) => {
      requireAdmin(context);
      if (!teacherIds || teacherIds.length === 0) {
        throw new Error('Не указаны учителя');
      }
      if (teacherIds.length > 3) {
        throw new Error('Не больше 3 учителей');
      }

      const activeSeason = await Season.findOne({ where: { isActive: true } });
      if (!activeSeason) throw new Error('Нет активного сезона');

      const newClass = await Class.create({ name, placeId, seasonId: activeSeason.id });
      await newClass.addTeachers(teacherIds);

      if (studentIds && studentIds.length > 0) {
        await User.update(
          { classId: newClass.id },
          { where: { id: studentIds, userLevel: 'STUDENT' } },
        );
      }

      return await Class.findByPk(newClass.id, { include: classInclude });
    },

    updateClass: async (_, { id, name, placeId, teacherIds, studentIds }, context) => {
      requireAdmin(context);
      const existingClass = await Class.findByPk(id);
      if (!existingClass) throw new Error('Класс не найден');

      if (name) existingClass.name = name;
      if (placeId) existingClass.placeId = placeId;

      await existingClass.save();

      if (teacherIds) {
        if (teacherIds.length === 0) throw new Error('Не указаны учителя');
        if (teacherIds.length > 3) throw new Error('Не больше 3 учителей');
        await existingClass.setTeachers(teacherIds);
      }

      if (studentIds) {
        const currentStudents = await existingClass.getStudents();
        const removedIds = currentStudents
          .filter((student) => !studentIds.includes(student.id))
          .map((student) => student.id);

        if (removedIds.length > 0) {
          await User.update({ classId: null }, { where: { id: removedIds } });
        }

        if (studentIds.length > 0) {
          await User.update({ classId: id }, { where: { id: studentIds, userLevel: 'STUDENT' } });
        }
      }

      return await Class.findByPk(id, { include: classInclude });
    },

    deleteClass: async (_, { id }, context) => {
      requireAdmin(context);
      const existingClass = await Class.findByPk(id);
      if (!existingClass) throw new Error('Класс не найден');

      const teachers = await existingClass.getTeachers();
      const students = await existingClass.getStudents();

      await existingClass.removeTeachers(teachers);
      await existingClass.removeStudents(students);
      await existingClass.destroy();

      return existingClass;
    },

    closeLesson: async (_, { classId, teacherId, studentIds, date: requestedDate }, context) => {
      requireStaff(context);
      const date = resolveCloseDate(requestedDate);

      // Начисление и создание урока одной транзакцией: без блокировки строк
      // студентов начисление читает баланс до параллельного перевода и затирает
      // его, а проверка «урок уже проведён» без блокировки класса пропускает
      // два одновременных закрытия и начисляет коины дважды.
      const { awardedStudentIds, coinsValue } = await sequelize.transaction(async (t) => {
        // Порядок блокировки везде одинаковый: сначала строки User, потом
        // ресурс (класс / мастер-класс / группа). Иначе возможен дедлок.
        const students =
          studentIds.length > 0
            ? await User.findAll({
                where: { id: studentIds },
                order: [['id', 'ASC']],
                transaction: t,
                lock: t.LOCK.UPDATE,
              })
            : [];

        const existingClass = await Class.findByPk(classId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!existingClass) throw new Error('Класс не найден');

        const teacher = await User.findByPk(teacherId, { transaction: t });
        if (!teacher) throw new Error('Учитель не найден');

        // Все уроки за эту дату сразу: они отвечают и на «класс уже закрыт», и на
        // «студент уже получил coins за этот день». Дату урока нельзя держать в
        // User.lessonCoinsDate: при закрытии задним числом это поле уехало бы в
        // прошлое и разрешило повторное начисление за сегодня.
        // Читаем после блокировки студентов, иначе параллельное закрытие другого
        // класса ещё не видно.
        const lessonsOnDate = await Lesson.findAll({ where: { date }, transaction: t });
        if (lessonsOnDate.some((lesson) => String(lesson.classId) === String(classId))) {
          throw new Error('Урок за эту дату уже закрыт');
        }

        const awardedEarlierIds = new Set(
          lessonsOnDate.flatMap((lesson) =>
            (lesson.students ?? []).map((student) => String(student.id)),
          ),
        );

        const techData = await TechnicalData.findOne({ transaction: t });
        const coinsValue = techData?.lessonValue ?? 0;

        const awardedStudentIds = [];

        // Последовательно, а не Promise.all: у транзакции одно соединение,
        // параллельные запросы по нему выполнять нельзя.
        for (const student of students) {
          if (!coinsValue || awardedEarlierIds.has(String(student.id))) continue;

          student.coins += coinsValue;
          await student.save({ transaction: t });
          awardedStudentIds.push(student.id);
          await logCoinTransaction(
            { studentId: student.id, amount: coinsValue, reason: 'lesson' },
            t,
          );
        }

        await Lesson.create(
          {
            classId,
            teacherId,
            seasonId: existingClass.seasonId,
            date,
            students: students.map((student) => ({ id: student.id, name: student.name })),
          },
          { transaction: t },
        );

        return { awardedStudentIds, coinsValue };
      });

      // Пуши уходят после коммита и в фоне, ответ мутации их не ждёт
      Promise.allSettled(
        awardedStudentIds.map((studentId) =>
          context.sendPushNotification(studentId, 'Ты молодец!', `+${coinsValue} coins`, '/'),
        ),
      );

      return await Class.findByPk(classId, { include: classInclude });
    },
  },
};
