import { gql } from '@apollo/client';

export const GET_COIN_HISTORY = gql`
  query GetCoinHistory($studentId: ID!) {
    coinHistory(studentId: $studentId) {
      id
      amount
      reason
      createdAt
      counterparty {
        id
        name
      }
    }
  }
`;
