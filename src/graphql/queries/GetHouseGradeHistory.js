import { gql } from '@apollo/client';

export const GET_HOUSE_GRADE_HISTORY = gql`
  query GetHouseGradeHistory {
    houseGradeHistory {
      id
      date
      grade
      house {
        id
        number
      }
    }
  }
`;
