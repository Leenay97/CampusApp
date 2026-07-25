import { gql } from '@apollo/client';

export const GET_LIFE_FINE_HISTORY = gql`
  query GetLifeFineHistory {
    lifeFineHistory {
      id
      date
      count
      student {
        id
        name
        russianName
        group {
          id
          name
        }
      }
    }
  }
`;
