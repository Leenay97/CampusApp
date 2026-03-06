import { gql } from '@apollo/client';

export const GET_STUDENTS_BY_GROUP_ID = gql`
  query GetStudentsByGroupId($groupId: ID!) {
    students(groupId: $groupId) {
      id
      name
      russianName
      isActive
      coins
      workshops {
        id
        name
      }
    }
  }
`;
