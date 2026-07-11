import { Group, House, User } from '../../models/index.js';
import { requireAuth, requireAdmin } from '../auth.js';

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

      return existingHouse;
    },
  },
};
