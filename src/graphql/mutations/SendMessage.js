import { gql } from '@apollo/client';

export const SEND_MESSAGE = gql`
  mutation SendMessage($groupId: ID!, $authorId: ID!, $text: String!, $isStaffChat: Boolean) {
    sendMessage(groupId: $groupId, authorId: $authorId, text: $text, isStaffChat: $isStaffChat) {
      text
      authorId
    }
  }
`;
