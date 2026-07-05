import { gql } from '@apollo/client';

export const SET_VOTE_STATUS = gql`
  mutation SetVoteStatus($id: ID!, $status: VoteStatus!) {
    setVoteStatus(id: $id, status: $status) {
      id
      title
      status
      options {
        id
        name
        votesNumber
      }
    }
  }
`;
