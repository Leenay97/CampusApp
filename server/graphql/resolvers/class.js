import { Class, Lesson, Place, Season, TechnicalData, User } from '../../models/index.js';

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
    classes: async () => {
      const activeSeason = await Season.findOne({ where: { isActive: true } });
      if (!activeSeason) return [];

      return await Class.findAll({
        where: { seasonId: activeSeason.id },
        include: classInclude,
      });
    },
    class: async (_, { id }) => {
      return await Class.findByPk(id, { include: classInclude });
    },
    classByUserId: async (_, { userId }) => {
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
    classesByTeacher: async (_, { teacherId }) => {
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
    createClass: async (_, { name, teacherIds, studentIds, placeId }) => {
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

    updateClass: async (_, { id, name, place }) => {
      const existingClass = await Class.findByPk(id);
      if (!existingClass) throw new Error('Класс не найден');

      if (name) existingClass.name = name;
      if (place) existingClass.place = place;

      await existingClass.save();

      return await Class.findByPk(id, { include: classInclude });
    },

    deleteClass: async (_, { id }) => {
      const existingClass = await Class.findByPk(id);
      if (!existingClass) throw new Error('Класс не найден');

      const teachers = await existingClass.getTeachers();
      const students = await existingClass.getStudents();

      await existingClass.removeTeachers(teachers);
      await existingClass.removeStudents(students);
      await existingClass.destroy();

      return existingClass;
    },

    closeLesson: async (_, { classId, teacherId, studentIds }) => {
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

      await Promise.all(
        students.map((student) => {
          // Коины за урок начисляются не чаще раза в день
          if (!coinsValue || student.lessonCoinsDate === date) return null;

          student.coins += coinsValue;
          student.lessonCoinsDate = date;
          return student.save();
        }),
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
