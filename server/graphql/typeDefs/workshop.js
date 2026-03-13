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
    isClosed: Boolean
  }

  extend type Query {
    workshops: [Workshop]
    workshop(id: ID!): Workshop
    todayWorkshops: [Workshop]
    workshopsByUser(userId: ID!): [Workshop]
    workshopsByTeacher(userId: ID!): [Workshop]
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
    ): Workshop
    joinWorkshop(studentId: ID!, workshopId: ID!): Workshop
    closeWorkshop(studentIds: [ID!]!, workshopId: ID!): Workshop
  }
`;
