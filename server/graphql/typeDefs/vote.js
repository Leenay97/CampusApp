import { gql } from 'apollo-server-express';

export const voteTypeDefs = gql`
  input VoteOptionInput {
    name: String!
    votesNumber: Int
  }

  enum VoteStatus {
    DRAFT
    ACTIVE
    FINISHED
  }

  type Vote {
    id: ID!
    title: String!
    status: VoteStatus!
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
    setVoteStatus(id: ID!, status: VoteStatus!): Vote
    deleteVote(id: ID!): Vote
    castVote(voteId: ID!, optionId: ID!, userId: ID!): Vote
  }
`;
