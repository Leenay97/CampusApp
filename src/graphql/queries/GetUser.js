import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      group {
        id
        name
        places
      }
      russianName
      coins
      userLevel
    }
  }
`;
