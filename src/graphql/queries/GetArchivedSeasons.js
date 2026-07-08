import { gql } from '@apollo/client';

export const GET_ARCHIVED_SEASONS = gql`
  query GetArchivedSeasons {
    archivedSeasons {
      id
      number
      year
      startDate
      endDate
    }
  }
`;
