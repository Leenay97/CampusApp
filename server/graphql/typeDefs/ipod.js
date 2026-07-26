import { gql } from 'apollo-server-express';

export const ipodTypeDefs = gql`
  type IpodPair {
    id: ID!
    seasonId: ID!
    name: String!
    creatorId: ID
    students: [User]!
  }

  type IpodMatch {
    id: ID!
    seasonId: ID!
    round: Int!
    date: String
    pairs: [IpodPair]!
    winner: IpodPair
    isDraw: Boolean!
  }

  type IpodRoundName {
    round: Int!
    name: String!
  }

  type IpodTournament {
    seasonId: ID!
    currentRound: Int!
    roundNames: [IpodRoundName!]!
  }

  extend type Query {
    ipodPairs(seasonId: ID!): [IpodPair]
    ipodMatches(seasonId: ID!): [IpodMatch]
    ipodWaitingPairs(seasonId: ID!): [IpodPair]
    ipodTournament(seasonId: ID!): IpodTournament!
  }

  extend type Mutation {
    createIpodPair(name: String!, studentIds: [ID!]!, seasonId: ID!): IpodPair
    deleteIpodPair(id: ID!): IpodPair
    createIpodMatch(pairIds: [ID!]!, seasonId: ID!, date: String!): IpodMatch
    setIpodMatchWinner(id: ID!, winnerId: ID!): IpodMatch
    setIpodMatchDate(id: ID!, date: String!): IpodMatch
    advanceIpodRound(seasonId: ID!): IpodTournament!
    setIpodRoundName(seasonId: ID!, round: Int!, name: String!): IpodTournament!
  }
`;
