import { gql } from '@apollo/client';

export const GET_ARCHIVED_SEASON = gql`
  query GetArchivedSeason($id: ID!) {
    archivedSeason(id: $id) {
      id
      number
      year
      groups {
        id
        name
        teachers {
          id
          name
        }
        students {
          id
          name
          russianName
          photoUrl
        }
      }
      workshops {
        id
        name
        date
        teacher
      }
      sporttimes {
        id
        name
        date
        teacher
      }
    }
  }
`;
