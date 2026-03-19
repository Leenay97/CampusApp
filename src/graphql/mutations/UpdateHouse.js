import { gql } from '@apollo/client';

export const UPDATE_HOUSE = gql`
  mutation UpdateHouse($id: ID!, $grade: Int) {
    updateHouse(id: $id, grade: $grade) {
      number
      grade
    }
  }
`;
