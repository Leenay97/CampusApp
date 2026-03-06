import { gql } from '@apollo/client';

export const CREATE_PLACE = gql`
  mutation CreatePlace($name: String!, $isTeamPlace: Boolean!, $color: String) {
    createPlace(name: $name, isTeamPlace: $isTeamPlace, color: $color) {
      id
      name
      isTeamPlace
      color
    }
  }
`;
