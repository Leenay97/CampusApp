import { Schedule } from '../../models/index.js';

export const scheduleResolvers = {
  Query: {
    schedule: async () => {
      return await Schedule.findOne();
    },
  },
  Mutation: {
    updateSchedule: async (_, { dayName, schedule }) => {
      const existingSchedule = await Schedule.findOne();
      if (!existingSchedule) {
        const newSchedule = await Schedule.create({ dayName, schedule });
        return newSchedule;
      }
      existingSchedule.dayName = dayName;
      existingSchedule.schedule = schedule;
      existingSchedule.save();
      return existingSchedule;
    },

    deleteSchedule: async () => {
      const schedule = await Schedule.findOne();
      schedule.destroy();
    },
  },
};
