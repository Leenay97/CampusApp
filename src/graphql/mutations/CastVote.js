import { gql } from '@apollo/client';

export const CAST_VOTE = gql`
  mutation CastVote($voteId: ID!, $optionId: ID!, $userId: ID!) {
    castVote(voteId: $voteId, optionId: $optionId, userId: $userId) {
      id
      title
      votedOptionId
      options {
        id
        name
      }
    }
  }
`;
