import { gql } from '@apollo/client';

export const GET_WORKSHOPS = gql`
  query GetWorkshops {
    workshops {
      id
      name
      description
      teacher {
        name
      }
      place
      maxStudents
      isClosed
    }
  }
`;
