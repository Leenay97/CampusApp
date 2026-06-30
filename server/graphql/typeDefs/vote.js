import { gql } from 'apollo-server-express';

export const voteTypeDefs = gql`
  input VoteOptionInput {
    name: String!
    votesNumber: Int
  }

  type Vote {
    id: ID!
    title: String!
    options: [VoteOption]!
    votedOptionId: ID
  }

  type VoteOption {
    id: ID!
    name: String!
    votesNumber: Int!
  }

  extend type Query {
    getVotes(seasonId: ID!, userId: ID): [Vote]
  }

  extend type Mutation {
    createVote(title: String!, options: [VoteOptionInput]!, seasonId: ID!): Vote
    updateVote(id: ID!, title: String, options: [VoteOptionInput]): Vote
    deleteVote(id: ID!): Vote
    castVote(voteId: ID!, optionId: ID!, userId: ID!): Vote
  }
`;
