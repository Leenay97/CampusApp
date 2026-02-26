import { userResolvers } from './user.js';
import { groupResolvers } from './group.js';
import { workshopResolvers } from './workshop.js';

export const resolvers = [userResolvers, groupResolvers, workshopResolvers];
