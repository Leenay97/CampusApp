import { gql } from '@apollo/client';

export const ADVANCE_IPOD_ROUND = gql`
  mutation AdvanceIpodRound($seasonId: ID!) {
    advanceIpodRound(seasonId: $seasonId) {
      seasonId
      currentRound
    }
  }
`;
