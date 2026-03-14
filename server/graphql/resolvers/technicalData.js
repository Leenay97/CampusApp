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
      { workshopValue, sportTimeValue, workshopStart, sportTimeStart },
    ) => {
      const existingTechData = await TechnicalData.findOne();
      if (!existingTechData) {
        const techData = await TechnicalData.create({
          workshopValue,
          sportTimeValue,
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

      if (workshopStart) {
        existingTechData.workshopStart = workshopStart;
      }

      if (sportTimeStart) {
        existingTechData.sportTimeStart = sportTimeStart;
      }

      existingTechData.save();
      return existingTechData;
    },
  },
};
