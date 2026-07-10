import { gql } from '@apollo/client';

export const GET_CLASSES_BY_TEACHER = gql`
  query GetClassesByTeacher($teacherId: ID!) {
    classesByTeacher(teacherId: $teacherId) {
      id
      name
      isClosedToday
      place {
        id
        name
      }
      teachers {
        id
        name
      }
      students {
        id
        name
      }
    }
  }
`;
