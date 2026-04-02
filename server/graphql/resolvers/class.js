import { Class, Place, Season, User } from '../../models/index.js';

export const classResolvers = {
  Query: {
    classes: async () => {
      return await Class.findAll({
        include: [
          { model: Place, as: 'place' },
          { model: User, as: 'teachers' },
          { model: User, as: 'students' },
        ],
      });
    },
    class: async (_, { id }) => {
      return await Class.findByPk(id, {
        include: [
          { model: Place, as: 'place' },
          { model: User, as: 'teachers' },
          { model: User, as: 'students' },
        ],
      });
    },
    classByUserId: async (_, { userId }) => {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('Пользователь не найден');

      if (user.userLevel === 'student') {
        return await Class.findOne({
          where: { id: user.classId },
          include: [
            { model: Place, as: 'place' },
            { model: User, as: 'teachers' },
            { model: User, as: 'students' },
          ],
        });
      }

      if (user.userLevel === 'teacher') {
        const classes = await user.getTaughtClasses({
          include: [
            { model: Place, as: 'place' },
            { model: User, as: 'teachers' },
            { model: User, as: 'students' },
          ],
        });
        return classes[0] || null;
      }

      return null;
    },
  },

  Mutation: {
    createClass: async (_, { name, teacherIds, placeId }) => {
      if (!teacherIds || teacherIds.length === 0) {
        throw new Error('Не указаны учителя');
      }

      const newClass = await Class.create({ name, placeId });
      for (const teacherId of teacherIds) {
        const teacher = await User.findByPk(teacherId);
        await newClass.addTeacher(teacher);
      }

      const activeSeason = await Season.findOne({ where: { isActive: true } });

      if (!activeSeason) throw new Error('Нет активного сезона');
      newClass.seasonId = activeSeason.id;

      return await Class.findByPk(newClass.id, {
        include: [
          { model: Place, as: 'place' },
          { model: User, as: 'teachers' },
          { model: User, as: 'students' },
        ],
      });
    },

    updateClass: async (_, { id, name, place }) => {
      const existingClass = await Class.findByPk(id);
      if (!existingClass) throw new Error('Класс не найден');

      if (name) existingClass.name = name;
      if (place) existingClass.place = place;

      await existingClass.save();

      return await Class.findByPk(id, {
        include: [
          { model: Place, as: 'place' },
          { model: User, as: 'teachers' },
          { model: User, as: 'students' },
        ],
      });
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
  },
};
