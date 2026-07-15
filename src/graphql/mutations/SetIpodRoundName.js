import { gql } from '@apollo/client';

export const SET_IPOD_ROUND_NAME = gql`
  mutation SetIpodRoundName($seasonId: ID!, $round: Int!, $name: String!) {
    setIpodRoundName(seasonId: $seasonId, round: $round, name: $name) {
      seasonId
      currentRound
      roundNames {
        round
        name
      }
    }
  }
`;
