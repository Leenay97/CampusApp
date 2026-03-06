import { Place } from '../../models/index.js';

export const placeResolvers = {
  Query: {
    places: async () => {
      return await Place.findAll();
    },
    teamPlaces: async () => {
      return await Place.findAll({ where: { isTeamPlace: true } });
    },
    place: async (_, { id }) => {
      return await Place.findByPk(id);
    },
  },
  Mutation: {
    createPlace: async (_, { name, isTeamPlace, color }) => {
      const existingPlace = await Place.findOne({ where: { name } });
      if (existingPlace) throw new Error('Место уже существует');
      if (isTeamPlace && !color) throw new Error('У группового места должен быть выбран цвет');
      if (!isTeamPlace && color) throw new Error('У негруппового места не может быть выбран цвет');
      return await Place.create({ name, isTeamPlace, color });
    },

    //   addPoints: async (_, { id, amount }) => {
    //     const group = await Group.findByPk(id);
    //     if (!group) throw new Error('Group not found');

    //     group.points += amount;
    //     await group.save();
    //     return group;
    //   },

    //   deleteGroup: async (_, { id }) => {
    //     const group = await Group.findByPk(id);
    //     if (!group) throw new Error('Group not found');

    //     await group.destroy();
    //     return group;
    //   },
  },
};
