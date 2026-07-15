import { gql } from '@apollo/client';

export const MESSAGE_SENT = gql`
  subscription OnMessageSent($groupId: ID!) {
    messageSent(groupId: $groupId) {
      id
      text
      type
      createdAt
      author {
        id
        name
        userLevel
        photoUrl
      }
    }
  }
`;
