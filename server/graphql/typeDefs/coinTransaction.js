import { gql } from 'apollo-server-express';

export const coinTransactionTypeDefs = gql`
  type CoinTransaction {
    id: ID!
    amount: Int!
    reason: String
    counterparty: User
    createdAt: String!
  }

  extend type Query {
    coinHistory(studentId: ID!): [CoinTransaction!]!
  }
`;
