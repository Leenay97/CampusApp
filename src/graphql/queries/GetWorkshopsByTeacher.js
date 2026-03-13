import { gql } from '@apollo/client';

export const GET_WORKSHOPS_BY_TEACHER = gql`
  query GetWorkshopsByTeacher($userId: ID!) {
    workshopsByTeacher(userId: $userId) {
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
      placeId
      maxStudents
      isClosed
    }
  }
`;
