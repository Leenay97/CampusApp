import { gql } from '@apollo/client';

export const TRANSFER_COINS = gql`
  mutation TransferCoins($userId: ID!, $recieverId: ID!, $amount: Int!, $comment: String) {
    transferCoins(userId: $userId, recieverId: $recieverId, amount: $amount, comment: $comment) {
      id
      name
      coins
    }
  }
`;
