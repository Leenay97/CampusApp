import { gql } from '@apollo/client';

export const CREATE_SEASON = gql`
  mutation CreateSeason($number: String!, $year: String!, $groupTeachers: [GroupInput!]!) {
    createSeason(number: $number, year: $year, groupTeachers: $groupTeachers) {
      year
      number
    }
  }
`;
