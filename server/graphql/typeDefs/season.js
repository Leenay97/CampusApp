import { gql } from 'apollo-server-express';

export const seasonTypeDefs = gql`
  type Season {
    id: ID!
    year: String!
    number: String!
    isActive: Boolean!
    isArchived: Boolean!
    startDate: String!
    endDate: String!
    groups: [Group!]!
  }

  input GroupInput {
    name: String!
    teacherIds: [ID!]!
  }

  type ArchivedPerson {
    id: ID
    name: String
    russianName: String
    photoUrl: String
  }

  type ArchivedGroup {
    id: ID!
    name: String!
    teachers: [ArchivedPerson!]!
    students: [ArchivedPerson!]!
  }

  type ArchivedWorkshop {
    id: ID!
    name: String!
    date: String
    teacher: String
  }

  type ArchivedLessonCount {
    name: String!
    count: Int!
  }

  type ArchivedSeason {
    id: ID!
    number: String!
    year: String!
    startDate: String
    endDate: String
    groups: [ArchivedGroup!]!
    workshops: [ArchivedWorkshop!]!
    sporttimes: [ArchivedWorkshop!]!
    lessonCounts: [ArchivedLessonCount!]!
  }

  extend type Query {
    seasons: [Season]!
    season: Season!
    activeSeason: Season!
    archivedSeasons: [ArchivedSeason!]!
    archivedSeason(id: ID!): ArchivedSeason
  }

  extend type Mutation {
    createSeason(year: String!, number: String!, startDate: String!, endDate: String!): Season
    activateSeason(id: ID!): Season
    archiveSeason(id: ID!): Season
    updateSeason(id: ID!, number: String, year: String): Season
    deleteSeason(id: ID!): Season
  }
`;
