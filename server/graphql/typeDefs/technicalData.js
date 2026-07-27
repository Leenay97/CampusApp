import { gql } from 'apollo-server-express';

export const technicalDataTypeDefs = gql`
  type TechnicalData {
    workshopValue: Int
    sportTimeValue: Int
    lessonValue: Int
    sportTimeStart: String
    workshopStart: String
    workshopEnd: String
    isRatingShown: Boolean
    isElectionShown: Boolean
  }

  extend type Query {
    technicalData: TechnicalData
  }

  extend type Mutation {
    updateTechnicalData(
      workshopValue: Int
      sportTimeValue: Int
      lessonValue: Int
      sportTimeStart: String
      workshopStart: String
      workshopEnd: String
      isRatingShown: Boolean
      isElectionShown: Boolean
    ): TechnicalData
  }
`;
