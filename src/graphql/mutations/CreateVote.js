import { gql } from '@apollo/client';

export const CREATE_VOTE = gql`
  mutation CreateVote($title: String!, $options: [VoteOptionInput]!, $seasonId: ID!) {
    createVote(title: $title, options: $options, seasonId: $seasonId) {
      id
      title
      options {
        id
        name
        votesNumber
      }
    }
  }
`;
