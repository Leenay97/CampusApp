import { gql } from '@apollo/client';

export const GET_MESSAGES = gql`
  query GetMessages($groupId: ID!) {
    getMessages(groupId: $groupId) {
      id
      text
      author {
        id
        name
        userLevel
        photoUrl
      }
      createdAt
    }
  }
`;
