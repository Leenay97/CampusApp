import { gql } from '@apollo/client';

export const UPDATE_GROUP = gql`
  mutation UpdateGroup($id: ID!, $amount: Int, $places: String, $teacherIds: [ID], $name: String) {
    updateGroup(id: $id, amount: $amount, places: $places, teacherIds: $teacherIds, name: $name) {
      name
      points
      places
    }
  }
`;
