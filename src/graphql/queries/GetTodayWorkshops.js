import { gql } from '@apollo/client';

export const GET_TODAY_WORKSHOPS = gql`
  query GetTodayWorkshops {
    todayWorkshops {
      id
      name
      description
      teacher {
        name
      }
      students {
        id
        name
      }
      place {
        id
        name
      }
      maxStudents
      maxAge
      isClosed
    }
  }
`;
