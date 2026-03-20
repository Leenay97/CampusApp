import { gql } from '@apollo/client';

export const GET_WORKSHOPS_BY_TEACHER = gql`
  query GetWorkshopsByTeacher($userId: ID!) {
    workshopsByTeacher(userId: $userId) {
      id
      name
      description
      date
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
      isClosed
    }
  }
`;
