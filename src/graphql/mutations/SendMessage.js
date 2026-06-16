import { gql } from '@apollo/client';

export const SEND_MESSAGE = gql`
  mutation SendMessage($groupId: ID!, $authorId: ID!, $text: String!) {
    sendMessage(groupId: $groupId, authorId: $authorId, text: $text) {
      text
      authorId
    }
  }
`;
