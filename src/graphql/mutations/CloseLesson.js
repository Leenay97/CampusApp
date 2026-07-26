import { gql } from '@apollo/client';

export const CLOSE_LESSON = gql`
  mutation CloseLesson($classId: ID!, $teacherId: ID!, $studentIds: [ID!]!, $date: String) {
    closeLesson(classId: $classId, teacherId: $teacherId, studentIds: $studentIds, date: $date) {
      id
      closedDates
    }
  }
`;
