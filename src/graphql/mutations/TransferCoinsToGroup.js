import { gql } from '@apollo/client';

export const TRANSFER_COINS_TO_GROUP = gql`
  mutation TransferCoinsToGroup($groupId: ID!, $amount: Int!) {
    transferCoinsToGroup(groupId: $groupId, amount: $amount) {
      id
      name
      coins
    }
  }
`;
