import { gql } from 'apollo-server-express';

export const technicalDataTypeDefs = gql`
  type TechnicalData {
    workshopValue: Int
    sportTimeValue: Int
    sportTimeStart: String
    workshopStart: String
    isRatingShown: Boolean
  }

  extend type Query {
    technicalData: TechnicalData
  }

  extend type Mutation {
    updateTechnicalData(
      workshopValue: Int
      sportTimeValue: Int
      sportTimeStart: String
      workshopStart: String
      isRatingShown: Boolean
    ): TechnicalData
  }
`;
