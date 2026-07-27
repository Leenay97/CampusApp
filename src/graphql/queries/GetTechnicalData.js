import { gql } from '@apollo/client';

export const GET_TECHICAL_DATA = gql`
  query GetTechnicalData {
    technicalData {
      workshopValue
      sportTimeValue
      lessonValue
      workshopStart
      workshopEnd
      sportTimeStart
      isRatingShown
      isElectionShown
    }
  }
`;
