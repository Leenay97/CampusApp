import { gql } from '@apollo/client';

export const MESSAGE_SENT = gql`
  subscription OnMessageSent($groupId: ID!) {
    messageSent(groupId: $groupId) {
      id
      text
      createdAt
      author {
        id
        name
        userLevel
      }
    }
  }
`;
