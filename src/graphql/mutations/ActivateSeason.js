import { gql } from '@apollo/client';

export const ACTIVATE_SEASON = gql`
  mutation ActivateSeason($id: ID!) {
    activateSeason(id: $id) {
      year
      number
    }
  }
`;
