import { gql } from '@apollo/client';

export const TRANSFER_COINS_TO_GROUP = gql`
  mutation TransferCoinsToGroup($userId: ID!, $groupId: ID!, $amount: Int!) {
    transferCoinsToGroup(userId: $userId, groupId: $groupId, amount: $amount) {
      id
      name
      coins
    }
  }
`;
