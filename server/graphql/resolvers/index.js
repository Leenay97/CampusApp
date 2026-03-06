import { userResolvers } from './user.js';
import { groupResolvers } from './group.js';
import { workshopResolvers } from './workshop.js';
import { seasonResolvers } from './season.js';
import { placeResolvers } from './place.js';

export const resolvers = [
  userResolvers,
  groupResolvers,
  workshopResolvers,
  seasonResolvers,
  placeResolvers,
];
