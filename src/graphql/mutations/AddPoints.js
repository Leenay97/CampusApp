import { gql } from '@apollo/client';

export const ADD_POINTS = gql`
  mutation AddPoints($id: ID!, $amount: Int) {
    addPoints(id: $id, amount: $amount) {
      name
      points
    }
  }
`;
