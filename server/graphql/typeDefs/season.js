import { gql } from 'apollo-server-express';

export const seasonTypeDefs = gql`
  type Season {
    id: ID!
    year: String!
    number: String!
    isActive: Boolean!
    isArchived: Boolean!
  }

  input GroupInput {
    name: String!
    teacherIds: [ID!]!
  }

  extend type Query {
    seasons: [Season]!
    season: Season!
  }

  extend type Mutation {
    createSeason(year: String!, number: String!, groupTeachers: [GroupInput!]!): Season
    activateSeason(id: ID!): Season
    updateSeason(id: ID!): Season
    deleteSeason(id: ID!): Season
  }
`;
