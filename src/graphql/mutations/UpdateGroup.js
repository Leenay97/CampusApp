import { gql } from '@apollo/client';

export const UPDATE_GROUP = gql`
  mutation UpdateGroup($id: ID!, $amount: Int, $places: String) {
    updateGroup(id: $id, amount: $amount, places: $places) {
      name
      points
      places
    }
  }
`;
