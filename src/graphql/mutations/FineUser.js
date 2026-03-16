import { gql } from '@apollo/client';

export const FINE_USER = gql`
  mutation FineUser($id: ID!) {
    fineUser(id: $id) {
      id
      name
    }
  }
`;
