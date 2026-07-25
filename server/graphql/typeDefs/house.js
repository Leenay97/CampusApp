import { gql } from 'apollo-server-express';

export const houseTypeDefs = gql`
  type House {
    id: ID!
    number: String
    users: [User]
    grade: Int
  }

  type HouseGradeHistoryEntry {
    id: ID!
    date: String
    grade: Int
    house: House
  }

  extend type Query {
    houses: [House]
    house(id: ID!): House
    houseGradeHistory: [HouseGradeHistoryEntry]
  }

  extend type Mutation {
    createHouse(number: String!): House
    updateHouse(id: ID!, grade: Int): House
    deleteHouse(id: ID!): House
    resetHouseGrades: [House]
  }
`;
