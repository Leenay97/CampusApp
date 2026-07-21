import { gql } from '@apollo/client';

export const SET_MESSAGE_REACTION = gql`
  mutation SetMessageReaction($messageId: ID!, $emoji: String!) {
    setMessageReaction(messageId: $messageId, emoji: $emoji) {
      id
      myReaction
      reactions {
        emoji
        count
      }
    }
  }
`;
