import { gql } from '@apollo/client';

export const GET_ACTIVE_SEASON = gql`
  query GetActiveSeasons {
    activeSeason {
      startDate
      endDate
      groups {
        id
        name
        places
      }
    }
  }
`;
