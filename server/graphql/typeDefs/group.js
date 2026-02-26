import { gql } from 'apollo-server-express';

export const groupTypeDefs = gql`
  type Group {
    id: ID!
    name: String
    students: [User]
    teachers: [User]
    points: Int
  }

  extend type Query {
    groups: [Group]
    group(id: ID!): Group
    groupByUserId(userId: ID!): Group
  }

  extend type Mutation {
    createGroup(name: String!, userIds: [ID!]!): Group
    addPoints(id: ID!, amount: Int): Group
    deleteGroup(id: ID!): Group
  }
`;
