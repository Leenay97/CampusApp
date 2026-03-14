import { gql } from '@apollo/client';

export const GET_TECHICAL_DATA = gql`
  query GetTechnicalData {
    technicalData {
      workshopValue
      sportTimeValue
      workshopStart
      sportTimeStart
    }
  }
`;
