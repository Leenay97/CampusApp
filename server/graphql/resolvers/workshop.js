import { User, Workshop, Group } from '../../models/index.js';

export const workshopResolvers = {
  Query: {
    workshops: async () => {
      return await Workshop.findAll({
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'workshops' },
        ],
      });
    },
    workshop: async (_, { id }) => {
      return await Workshop.findByPk(id, {
        include: [
          { model: Group, as: 'group' },
          { model: Workshop, as: 'workshops' },
        ],
      });
    },

    workshopsByUser: async (_, { userId }) => {
      // Сначала находим пользователя, затем воркшоп
      const user = await User.findByPk(userId);
      if (!user) return [];
      return await Workshop.findAll({
        where: { id: user.workshopId },
        include: [{ model: Workshop, as: 'workshops' }],
      });
    },
  },

  Mutation: {
    createWorkshop: async (_, { name, description, place, teacherId, maxStudents }) => {
      const workshop = await Workshop.create({
        name,
        description,
        place,
        teacherId,
        maxStudents,
      });
      return workshop;
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
