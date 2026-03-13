import { gql } from '@apollo/client';

export const GET_PLACE = gql`
  query GetPlace($id: ID!) {
    place(id: $id) {
      id
      name
      color
    }
  }
`;
