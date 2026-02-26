import { gql } from 'apollo-server-express';

export const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    russianName: String!
    coins: Int
    group: Group
    workshops: [Workshop]
  }

  extend type Query {
    students: [User]
    teachers: [User]
    user(id: ID!): User
    usersByGroup(groupId: ID!): [User]
    usersByWorkshop(workshopId: ID!): [User]
  }

  extend type Mutation {
    createStudent(name: String!, russianName: String!, groupId: ID!): User
    createTeacher(name: String!): User
    updateUser(id: ID!, name: String, russianName: String, groupId: ID): User
    deleteUser(id: ID!): User
    transferCoins(id: ID!, amount: Int!): User
    addWorkshop(id: ID!, workshopId: ID!): User
  }
`;
