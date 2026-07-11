import { Place } from '../../models/index.js';
import { requireAuth, requireAdmin } from '../auth.js';

export const placeResolvers = {
  Query: {
    places: async (_, __, context) => {
      requireAuth(context);
      return await Place.findAll();
    },
    teamPlaces: async (_, __, context) => {
      requireAuth(context);
      return await Place.findAll({ where: { isTeamPlace: true } });
    },
    place: async (_, { id }, context) => {
      requireAuth(context);
      return await Place.findByPk(id);
    },
  },
  Mutation: {
    createPlace: async (_, { name, isTeamPlace, color }, context) => {
      requireAdmin(context);
      const existingPlace = await Place.findOne({ where: { name } });
      if (existingPlace) throw new Error('Место уже существует');
      if (isTeamPlace && !color) throw new Error('У группового места должен быть выбран цвет');
      if (!isTeamPlace && color) throw new Error('У негруппового места не может быть выбран цвет');
      return await Place.create({ name, isTeamPlace, color });
    },
  },
};
