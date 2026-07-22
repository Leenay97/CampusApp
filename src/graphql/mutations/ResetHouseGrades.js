import { gql } from '@apollo/client';

export const RESET_HOUSE_GRADES = gql`
  mutation ResetHouseGrades {
    resetHouseGrades {
      id
      grade
    }
  }
`;
