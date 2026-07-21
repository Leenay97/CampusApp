import { gql } from '@apollo/client';

export const GET_MESSAGES = gql`
  query GetMessages($groupId: ID!) {
    getMessages(groupId: $groupId) {
      id
      text
      type
      author {
        id
        name
        userLevel
        photoUrl
      }
      createdAt
      replyToId
      replyTo {
        id
        text
        type
        author {
          id
          name
        }
      }
      reactions {
        emoji
        count
      }
      myReaction
    }
  }
`;
