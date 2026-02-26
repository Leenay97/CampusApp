import { gql } from 'apollo-server-express';

export const workshopTypeDefs = gql`
  type Workshop {
    id: ID!
    name: String!
    description: String!
    place: String!
    teacher: User
    users: [User]
    maxStudents: Int
    isClosed: Boolean
  }

  extend type Query {
    workshops: [Workshop]
    workshop(id: ID!): Workshop
    workshopsByUser(userId: ID!): [Workshop]
  }

  extend type Mutation {
    createWorkshop(
      name: String!
      description: String!
      place: String!
      teacherId: ID!
      maxStudents: Int
    ): Workshop
    closeWorkshop(id: ID!): Workshop
  }
`;
