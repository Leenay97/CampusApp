import { gql } from '@apollo/client';

export const GET_VOTES = gql`
  query GetVotes($seasonId: ID!) {
    getVotes(seasonId: $seasonId) {
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

export const GET_VOTES_FOR_VOTING = gql`
  query GetVotesForVoting($seasonId: ID!, $userId: ID!) {
    getVotes(seasonId: $seasonId, userId: $userId) {
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
