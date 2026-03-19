import { gql } from 'apollo-server-express';

export const houseTypeDefs = gql`
  type House {
    id: ID!
    number: String
    users: [User]
    grade: Int
  }

  extend type Query {
    houses: [House]
    house(id: ID!): House
  }

  extend type Mutation {
    createHouse(id: ID!): House
    updateHouse(id: ID!, grade: Int): House
    deleteHouse(id: ID!): House
  }
`;
