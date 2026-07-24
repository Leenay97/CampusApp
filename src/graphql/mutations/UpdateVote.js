import { gql } from '@apollo/client';

export const UPDATE_VOTE = gql`
  mutation UpdateVote($id: ID!, $title: String, $options: [VoteOptionInput]) {
    updateVote(id: $id, title: $title, options: $options) {
      id
      title
      options {
        id
        name
        votesNumber
        groupId
      }
    }
  }
`;
