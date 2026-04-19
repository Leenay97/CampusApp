import { gql } from 'apollo-server-express';

export const baseTypeDefs = gql`
  scalar Upload

  type Query
  type Mutation
`;
