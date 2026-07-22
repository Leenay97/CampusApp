import { gql } from '@apollo/client';

export const MESSAGE_REACTION_SET = gql`
  subscription OnMessageReactionSet($groupId: ID!) {
    messageReactionSet(groupId: $groupId) {
      id
      reactions {
        emoji
        count
      }
      myReaction
    }
  }
`;
