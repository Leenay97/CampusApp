import { gql } from 'apollo-server-express';

export const baseTypeDefs = gql`
  scalar Upload

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }
`;
