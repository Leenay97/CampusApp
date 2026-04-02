import { gql } from 'apollo-server-express';

export const classTypeDefs = gql`
  type Class {
    id: ID!
    name: String
    students: [User]
    teachers: [User]
    place: Place
  }

  extend type Query {
    classes: [Class]
    class(id: ID!): Class
    classByUserId(userId: ID!): Class
  }

  extend type Mutation {
    createClass(name: String!, placeId: ID!, teacherIds: [ID!]!): Class
    updateClass(id: ID!, name: String, place: String): Class
    deleteClass(id: ID!): Class
  }
`;
