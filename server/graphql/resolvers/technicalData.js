import { TechnicalData } from '../../models/index.js';
import { requireAuth, requireAdmin } from '../auth.js';

export const technicalDataResolvers = {
  Query: {
    technicalData: async (_, __, context) => {
      requireAuth(context);
      return await TechnicalData.findOne();
    },
  },
  Mutation: {
    updateTechnicalData: async (
      _,
      {
        workshopValue,
        sportTimeValue,
        lessonValue,
        workshopStart,
        workshopEnd,
        sportTimeStart,
        isRatingShown,
        isElectionShown,
      },
      context,
    ) => {
      requireAdmin(context);
      const existingTechData = await TechnicalData.findOne();
      if (!existingTechData) {
        const techData = await TechnicalData.create({
          workshopValue,
          sportTimeValue,
          lessonValue,
          workshopStart,
          workshopEnd,
          sportTimeStart,
        });
        return techData;
      }
      if (workshopValue) {
        existingTechData.workshopValue = workshopValue;
      }
      if (sportTimeValue) {
        existingTechData.sportTimeValue = sportTimeValue;
      }
      if (lessonValue) {
        existingTechData.lessonValue = lessonValue;
      }

      if (workshopStart) {
        existingTechData.workshopStart = workshopStart;
      }

      if (workshopEnd !== undefined) {
        existingTechData.workshopEnd = workshopEnd;
      }

      if (sportTimeStart) {
        existingTechData.sportTimeStart = sportTimeStart;
      }

      if (isRatingShown !== undefined) {
        existingTechData.isRatingShown = isRatingShown;
      }

      if (isElectionShown !== undefined) {
        existingTechData.isElectionShown = isElectionShown;
      }

      await existingTechData.save();
      return existingTechData;
    },
  },
};
