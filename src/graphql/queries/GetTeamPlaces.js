import { gql } from '@apollo/client';

export const GET_TEAM_PLACES = gql`
  query GetTeamPlaces {
    teamPlaces {
      id
      name
      color
    }
  }
`;
