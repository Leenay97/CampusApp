import { gql } from '@apollo/client';

export const GET_HOUSES = gql`
  query GetHouses {
    houses {
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
