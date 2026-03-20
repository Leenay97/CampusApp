import { gql } from 'apollo-server-express';

export const workshopTypeDefs = gql`
  type Workshop {
    id: ID!
    name: String!
    description: String!
    placeId: ID!
    place: Place
    teacher: User
    students: [User]
    maxStudents: Int
    maxAge: Int
    date: String
    isClosed: Boolean
  }

  extend type Query {
    workshops(isSport: Boolean): [Workshop]
    workshop(id: ID!): Workshop
    todayWorkshops(isSport: Boolean): [Workshop]
    workshopsByUser(userId: ID!): [Workshop]
    workshopsByTeacher(userId: ID!, isSport: Boolean): [Workshop]
  }

  extend type Mutation {
    createWorkshop(
      name: String!
      description: String
      placeId: ID
      teacherId: ID
      maxStudents: Int
      maxAge: Int
      type: String!
      date: String!
    ): Workshop
    joinWorkshop(studentId: ID!, workshopId: ID!, isSport: Boolean): Workshop
    closeWorkshop(studentIds: [ID!]!, workshopId: ID!): Workshop
  }
`;
