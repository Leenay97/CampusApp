import { TechnicalData } from '../../models/index.js';

export const technicalDataResolvers = {
  Query: {
    technicalData: async () => {
      return await TechnicalData.findOne();
    },
  },
  Mutation: {
    updateTechnicalData: async (
      _,
      { workshopValue, sportTimeValue, lessonValue, workshopStart, sportTimeStart, isRatingShown },
    ) => {
      const existingTechData = await TechnicalData.findOne();
      if (!existingTechData) {
        const techData = await TechnicalData.create({
          workshopValue,
          sportTimeValue,
          lessonValue,
          workshopStart,
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

      if (sportTimeStart) {
        existingTechData.sportTimeStart = sportTimeStart;
      }

      if (isRatingShown !== undefined) {
        existingTechData.isRatingShown = isRatingShown;
      }

      existingTechData.save();
      return existingTechData;
    },
  },
};
