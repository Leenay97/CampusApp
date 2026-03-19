import { gql } from '@apollo/client';

export const CREATE_HOUSE = gql`
  mutation CreateHouse($number: String!) {
    createHouse(number: $number) {
      number
    }
  }
`;
