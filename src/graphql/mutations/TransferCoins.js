import { gql } from '@apollo/client';

export const TRANSFER_COINS = gql`
  mutation TransferCoins($userId: ID!, $recieverId: ID!, $amount: Int!) {
    transferCoins(userId: $userId, recieverId: $recieverId, amount: $amount) {
      id
      name
      coins
    }
  }
`;
