import { gql } from '@apollo/client';

export const SEND_MESSAGE = gql`
  mutation SendMessage(
    $groupId: ID!
    $authorId: ID!
    $text: String!
    $isStaffChat: Boolean
    $type: String
    $replyToId: ID
  ) {
    sendMessage(
      groupId: $groupId
      authorId: $authorId
      text: $text
      isStaffChat: $isStaffChat
      type: $type
      replyToId: $replyToId
    ) {
      text
      type
      authorId
    }
  }
`;
