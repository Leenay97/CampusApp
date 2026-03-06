import { gql } from '@apollo/client';

export const CREATE_SEASON = gql`
  mutation CreateSeason(
    $number: String!
    $year: String!
    $groupTeachers: [GroupInput!]!
    $startDate: String!
    $endDate: String!
  ) {
    createSeason(
      number: $number
      year: $year
      groupTeachers: $groupTeachers
      startDate: $startDate
      endDate: $endDate
    ) {
      year
      number
      startDate
      endDate
    }
  }
`;
