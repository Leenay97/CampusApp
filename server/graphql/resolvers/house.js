import { Group, House, HouseGradeHistory, User } from '../../models/index.js';
import { requireAuth, requireAdmin } from '../auth.js';

function todayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
}

export const houseResolvers = {
  Query: {
    houses: async (_, __, context) => {
      requireAuth(context);
      return await House.findAll({
        include: {
          model: User,
          as: 'users',
          include: {
            model: Group,
            as: 'group',
          },
        },
      });
    },
    house: async (_, { id }, context) => {
      requireAuth(context);
      return await House.findOne({
        where: { id },
        include: [
          {
            model: User,
            as: 'users',
            include: [
              {
                model: Group,
                as: 'group',
              },
            ],
          },
        ],
      });
    },
    houseGradeHistory: async (_, __, context) => {
      requireAdmin(context);
      return await HouseGradeHistory.findAll({
        include: [{ model: House, as: 'house' }],
        order: [['date', 'DESC']],
      });
    },
  },
  Mutation: {
    createHouse: async (_, { number }, context) => {
      requireAdmin(context);
      if (!number) throw new Error('Укажите номер');
      const existingHouse = await House.findOne({ where: { number } });
      if (existingHouse) throw new Error('Домик уже создан');
      const house = await House.create({
        number,
      });
      return house;
    },
    updateHouse: async (_, { id, grade }, context) => {
      // Оценку домику ставит только админ (в UI GradeSection виден только ему)
      requireAdmin(context);
      const existingHouse = await House.findByPk(id);
      if (!existingHouse) throw new Error('Домик не найден');

      if (grade !== undefined && grade !== null) {
        existingHouse.grade = grade;
      }

      await existingHouse.save();

      if (grade !== undefined && grade !== null) {
        const date = todayDate();
        const [historyEntry] = await HouseGradeHistory.findOrCreate({
          where: { houseId: id, date },
          defaults: { grade },
        });
        if (historyEntry.grade !== grade) {
          historyEntry.grade = grade;
          await historyEntry.save();
        }
      }

      return existingHouse;
    },
    resetHouseGrades: async (_, __, context) => {
      requireAdmin(context);
      await House.update({ grade: null }, { where: {} });
      return await House.findAll();
    },
  },
};
