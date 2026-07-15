import { gql } from '@apollo/client';

export const GET_IPOD_PAIRS = gql`
  query GetIpodPairs($seasonId: ID!) {
    ipodPairs(seasonId: $seasonId) {
      id
      name
      creatorId
      students {
        id
        name
        russianName
      }
    }
  }
`;
