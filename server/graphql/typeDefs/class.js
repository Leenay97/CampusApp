import { gql } from 'apollo-server-express';

export const classTypeDefs = gql`
  type Class {
    id: ID!
    name: String
    students: [User]
    teachers: [User]
    place: Place
    isClosedToday: Boolean!
  }

  extend type Query {
    classes: [Class]
    class(id: ID!): Class
    classByUserId(userId: ID!): Class
    classesByTeacher(teacherId: ID!): [Class!]!
  }

  extend type Mutation {
    createClass(name: String!, placeId: ID!, teacherIds: [ID!]!, studentIds: [ID!]): Class
    updateClass(id: ID!, name: String, placeId: ID, teacherIds: [ID!], studentIds: [ID!]): Class
    deleteClass(id: ID!): Class
    closeLesson(classId: ID!, teacherId: ID!, studentIds: [ID!]!): Class
  }
`;
