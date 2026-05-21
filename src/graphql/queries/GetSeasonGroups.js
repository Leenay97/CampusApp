import { gql } from '@apollo/client';

export const GET_SEASON_GROUPS = gql`
  query SeasonGroups($seasonId: ID!) {
    seasonGroups(seasonId: $seasonId) {
      id
      name
      points
      teachers {
        name
      }
    }
  }
`;
