import { gql } from '@apollo/client';

export const GET_IPOD_MATCHES = gql`
  query GetIpodMatches($seasonId: ID!) {
    ipodMatches(seasonId: $seasonId) {
      id
      round
      date
      pairs {
        id
        name
        students {
          id
          name
          russianName
        }
      }
      winner {
        id
      }
    }
  }
`;
