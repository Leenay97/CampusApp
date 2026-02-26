import { gql } from '@apollo/client';

export const DELETE_GROUP = gql`
  mutation DeleteGroup($id: ID!) {
    deleteGroup(id: $id) {
      id
      name
    }
  }
`;
