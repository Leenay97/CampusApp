import { gql } from '@apollo/client';

export const CLOSE_LESSON = gql`
  mutation CloseLesson($classId: ID!, $teacherId: ID!, $studentIds: [ID!]!) {
    closeLesson(classId: $classId, teacherId: $teacherId, studentIds: $studentIds) {
      id
      isClosedToday
    }
  }
`;
