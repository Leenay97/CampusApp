import { gql } from 'apollo-server-express';

export const userTypeDefs = gql`
  type User {
    id: ID!
    name: String
    russianName: String
    coins: Int
    group: Group
    userLevel: String!
    workshops: [Workshop]
    isActive: Boolean
    lives: Int
    house: House
    houseId: ID
    englishLevel: String
    class: Class
  }

  type AuthPayload {
    token: String!
    user: User!
    group: Group!
  }

  extend type Query {
    students(groupId: ID): [User]
    teachers: [User]
    user(id: ID!): User
    usersByGroup(groupId: ID!): [User]
    usersByWorkshop(workshopId: ID!): [User]
    seasonStudents: [User!]
  }

  extend type Mutation {
    login(login: String!, password: String!): AuthPayload!
    createStudent(russianName: String!, groupId: ID!): User
    createTeacher(name: String!): User
    registerTeacher(
      token: String!
      id: ID!
      login: String!
      password: String!
      confirmPassword: String!
    ): AuthPayload!
    registerStudent(
      token: String!
      name: String!
      login: String!
      password: String!
      confirmPassword: String!
    ): AuthPayload!
    updateUser(
      id: ID!
      name: String
      russianName: String
      groupId: ID
      houseId: ID
      classId: ID
      coins: Int
      englishLevel: String
    ): User
    deleteUser(id: ID!): User
    transferCoins(userId: ID!, recieverId: ID!, amount: Int!): User
    addWorkshop(id: ID!, workshopId: ID!): User
    fineUser(id: ID!): User
  }
`;
