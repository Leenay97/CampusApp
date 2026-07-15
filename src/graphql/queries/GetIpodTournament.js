import { gql } from '@apollo/client';

export const GET_IPOD_TOURNAMENT = gql`
  query GetIpodTournament($seasonId: ID!) {
    ipodTournament(seasonId: $seasonId) {
      seasonId
      currentRound
      roundNames {
        round
        name
      }
    }
  }
`;
