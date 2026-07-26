import { gql } from '@apollo/client';

export const SET_POST_PINNED = gql`
  mutation SetPostPinned($id: ID!, $isPinned: Boolean!) {
    setPostPinned(id: $id, isPinned: $isPinned) {
      id
      isPinned
    }
  }
`;
