import { gql } from 'apollo-server-express';

export const placeTypeDefs = gql`
  type Place {
    id: ID!
    name: String!
    isReserved: Boolean!
    isTeamPlace: Boolean!
    color: String
  }

  extend type Query {
    places: [Place]
    teamPlaces: [Place]
    place(id: ID!): Place
  }

  extend type Mutation {
    createPlace(name: String!, isTeamPlace: Boolean!, color: String): Place
    updatePlace(id: ID!, name: String, isReserved: Boolean, isTeamPlace: Boolean): Place
    deletePlace(id: ID!): Place
  }
`;
