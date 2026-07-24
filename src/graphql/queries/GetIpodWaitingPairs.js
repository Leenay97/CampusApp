import { gql } from '@apollo/client';

export const GET_IPOD_WAITING_PAIRS = gql`
  query GetIpodWaitingPairs($seasonId: ID!) {
    ipodWaitingPairs(seasonId: $seasonId) {
      id
      name
      creatorId
      students {
        id
        group {
          id
          name
        }
      }
    }
  }
`;
