import { gql } from '@apollo/client';

export const DELETE_VOTE = gql`
  mutation DeleteVote($id: ID!) {
    deleteVote(id: $id) {
      id
    }
  }
`;
