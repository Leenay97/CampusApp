import { gql } from '@apollo/client';

export const UPDATE_SCHEDULE = gql`
  mutation UpdateSchedule($dayName: String!, $schedule: String!) {
    updateSchedule(dayName: $dayName, schedule: $schedule) {
      dayName
      schedule
    }
  }
`;
