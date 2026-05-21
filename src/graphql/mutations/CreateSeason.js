import { gql } from '@apollo/client';

export const CREATE_SEASON = gql`
  mutation CreateSeason($number: String!, $year: String!, $startDate: String!, $endDate: String!) {
    createSeason(number: $number, year: $year, startDate: $startDate, endDate: $endDate) {
      year
      number
      startDate
      endDate
    }
  }
`;
