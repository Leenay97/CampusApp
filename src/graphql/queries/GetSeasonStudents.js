import { gql } from '@apollo/client';

export const GET_SEASON_STUDENTS = gql`
  query GetSeasonStudents {
    seasonStudents {
      id
      name
      russianName
      isActive
      coins
      lives
      house {
        number
      }
      group {
        id
        name
      }
      workshops {
        id
        name
      }
    }
  }
`;
