import { gql } from '@apollo/client';

export const GET_SEASONS = gql`
  query GetSeasons {
    seasons {
      id
      year
      number
      isActive
      isArchived
    }
  }
`;
