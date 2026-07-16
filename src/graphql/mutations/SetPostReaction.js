import { gql } from '@apollo/client';

export const SET_POST_REACTION = gql`
  mutation SetPostReaction($postId: ID!, $emoji: String!) {
    setPostReaction(postId: $postId, emoji: $emoji) {
      id
      myReaction
      reactions {
        emoji
        count
      }
    }
  }
`;
