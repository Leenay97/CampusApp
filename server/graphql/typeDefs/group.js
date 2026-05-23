import { gql } from 'apollo-server-express';

export const groupTypeDefs = gql`
  type Group {
    id: ID!
    name: String
    students: [User]
    teachers: [User]
    places: String
    points: Int
    rubbers: Int
  }

  extend type Query {
    groups: [Group]
    seasonGroups(seasonId: ID!): [Group]
    group(id: ID!): Group
    groupByUserId(userId: ID!): Group
  }

  extend type Mutation {
    createGroup(name: String!, userIds: [ID!]!, seasonId: ID!): Group
    updateGroup(id: ID!, amount: Int, places: String, teacherIds: [ID], name: String): Group
    deleteGroup(id: ID!): Group
  }
`;
