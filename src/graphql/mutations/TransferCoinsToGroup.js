import { gql } from '@apollo/client';

export const TRANSFER_COINS_TO_GROUP = gql`
  mutation TransferCoinsToGroup($groupId: ID!, $amount: Int!, $comment: String) {
    transferCoinsToGroup(groupId: $groupId, amount: $amount, comment: $comment) {
      id
      name
      coins
    }
  }
`;
