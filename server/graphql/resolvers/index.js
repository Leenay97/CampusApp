import { userResolvers } from './user.js';
import { groupResolvers } from './group.js';
import { workshopResolvers } from './workshop.js';
import { seasonResolvers } from './season.js';
import { placeResolvers } from './place.js';
import { scheduleResolvers } from './schedule.js';
import { technicalDataResolvers } from './technicalData.js';
import { houseResolvers } from './house.js';
import { postResolvers } from './post.js';
import { classResolvers } from './class.js';

export const resolvers = [
  userResolvers,
  groupResolvers,
  workshopResolvers,
  seasonResolvers,
  placeResolvers,
  scheduleResolvers,
  technicalDataResolvers,
  houseResolvers,
  postResolvers,
  classResolvers,
];
