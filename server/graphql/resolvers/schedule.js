import { Schedule } from '../../models/index.js';
import { requireAuth, requireAdmin } from '../auth.js';

export const scheduleResolvers = {
  Query: {
    schedule: async (_, __, context) => {
      requireAuth(context);
      return await Schedule.findOne();
    },
  },
  Mutation: {
    updateSchedule: async (_, { dayName, schedule }, context) => {
      requireAdmin(context);
      const existingSchedule = await Schedule.findOne();
      if (!existingSchedule) {
        const newSchedule = await Schedule.create({ dayName, schedule });
        return newSchedule;
      }
      existingSchedule.dayName = dayName;
      existingSchedule.schedule = schedule;
      await existingSchedule.save();
      return existingSchedule;
    },

    deleteSchedule: async (_, __, context) => {
      requireAdmin(context);
      const schedule = await Schedule.findOne();
      if (!schedule) return null;
      await schedule.destroy();
      return schedule;
    },
  },
};
