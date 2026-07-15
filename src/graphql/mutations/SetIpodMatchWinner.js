import { gql } from '@apollo/client';

export const SET_IPOD_MATCH_WINNER = gql`
  mutation SetIpodMatchWinner($id: ID!, $winnerId: ID!) {
    setIpodMatchWinner(id: $id, winnerId: $winnerId) {
      id
      winner {
        id
      }
    }
  }
`;
