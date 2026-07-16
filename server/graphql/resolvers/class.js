import { Class, Lesson, Place, Season, TechnicalData, User } from '../../models/index.js';
import { requireAuth, requireStaff, requireAdmin } from '../auth.js';
import { logCoinTransaction } from './coinTransaction.js';

const classInclude = [
  { model: Place, as: 'place' },
  { model: User, as: 'teachers' },
  { model: User, as: 'students' },
];

function todayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
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
    // Урок закрыт сегодня — снова «откроется» после полуночи, когда сменится дата
    isClosedToday: async (parent) => {
      const lesson = await Lesson.findOne({
        where: { classId: parent.id, date: todayDate() },
      });
      return Boolean(lesson);
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

    closeLesson: async (_, { classId, teacherId, studentIds }, context) => {
      requireStaff(context);
      const existingClass = await Class.findByPk(classId);
      if (!existingClass) throw new Error('Класс не найден');

      const teacher = await User.findByPk(teacherId);
      if (!teacher) throw new Error('Учитель не найден');

      const date = todayDate();
      const alreadyClosed = await Lesson.findOne({ where: { classId, date } });
      if (alreadyClosed) throw new Error('Урок сегодня уже проведён');

      const students =
        studentIds.length > 0 ? await User.findAll({ where: { id: studentIds } }) : [];

      const techData = await TechnicalData.findOne();
      const coinsValue = techData?.lessonValue ?? 0;

      const awardedStudentIds = [];

      await Promise.all(
        students.map(async (student) => {
          if (!coinsValue || student.lessonCoinsDate === date) return null;

          student.coins += coinsValue;
          student.lessonCoinsDate = date;
          await student.save();
          awardedStudentIds.push(student.id);
          return logCoinTransaction({
            studentId: student.id,
            amount: coinsValue,
            reason: 'lesson',
          });
        }),
      );

      Promise.allSettled(
        awardedStudentIds.map((studentId) =>
          context.sendPushNotification(studentId, 'Ты молодец!', `+${coinsValue} coins`, '/'),
        ),
      );

      await Lesson.create({
        classId,
        teacherId,
        seasonId: existingClass.seasonId,
        date,
        students: students.map((student) => ({ id: student.id, name: student.name })),
      });

      return await Class.findByPk(classId, { include: classInclude });
    },
  },
};
