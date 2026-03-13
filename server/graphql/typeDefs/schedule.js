import { gql } from 'apollo-server-express';

export const scheduleTypeDefs = gql`
  type Schedule {
    id: ID!
    dayName: String!
    schedule: String!
  }

  extend type Query {
    schedule: Schedule
  }

  extend type Mutation {
    updateSchedule(dayName: String!, schedule: String!): Schedule
    deleteSchedule: Schedule
  }
`;
