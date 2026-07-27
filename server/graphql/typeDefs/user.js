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
    photoUrl: String
    login: String
    birthday: String
  }

  type AuthPayload {
    token: String!
    user: User!
    # nullable: у ADMIN нет группы, register-мутации её не возвращают
    group: Group
  }

  type LifeFineHistoryEntry {
    id: ID!
    date: String
    count: Int
    student: User
  }

  extend type Query {
    students(groupId: ID): [User]
    teachers(includeAdmins: Boolean): [User]
    user(id: ID!): User
    usersByGroup(groupId: ID!): [User]
    usersByWorkshop(workshopId: ID!): [User]
    seasonStudents: [User!]
    teacherRegistrationToken: String!
    lifeFineHistory: [LifeFineHistoryEntry]
  }

  extend type Mutation {
    login(login: String!, password: String!): AuthPayload!
    createStudent(russianName: String!, groupId: ID!, birthday: String): User
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
      id: ID!
      name: String!
      login: String!
      password: String!
      confirmPassword: String!
    ): AuthPayload!
    registerStudentWithExistingAccount(
      token: String!
      login: String!
      password: String!
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
      birthday: String
    ): User
    deleteUser(id: ID!): User
    deleteUnregisteredStudents(groupId: ID!): [User]
    uploadAvatar(file: Upload!, userId: ID!): User!
    deleteAvatar(userId: ID!): User!
    transferCoins(userId: ID!, recieverId: ID!, amount: Int!, comment: String): User
    transferCoinsToGroup(groupId: ID!, amount: Int!, comment: String): [User]
    fineUser(id: ID!): User
    generatePasswordResetLink(userId: ID!): String!
    resetPassword(token: String!, password: String!, confirmPassword: String!): Boolean!
    changePassword(
      currentPassword: String!
      newPassword: String!
      confirmPassword: String!
    ): Boolean!
  }
`;
