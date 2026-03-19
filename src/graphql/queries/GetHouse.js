import { gql } from '@apollo/client';

export const GET_HOUSE = gql`
  query GetHouse($id: ID!) {
    house(id: $id) {
      id
      number
      grade
      users {
        id
        name
        group {
          id
          name
        }
      }
    }
  }
`;
