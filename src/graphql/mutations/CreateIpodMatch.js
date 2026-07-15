import { gql } from '@apollo/client';

export const CREATE_IPOD_MATCH = gql`
  mutation CreateIpodMatch($pairIds: [ID!]!, $seasonId: ID!, $date: String!) {
    createIpodMatch(pairIds: $pairIds, seasonId: $seasonId, date: $date) {
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
