import { gql } from '@apollo/client';

export const GET_SCHEDULE = gql`
  query GetSchedule {
    schedule {
      dayName
      schedule
    }
  }
`;
