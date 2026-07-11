import { gql } from '@apollo/client';

export const GET_ACTIVE_SEASON = gql`
  query GetActiveSeasons {
    activeSeason {
      id
      startDate
      endDate
      groups {
        id
        name
        places
        points
      }
    }
  }
`;
