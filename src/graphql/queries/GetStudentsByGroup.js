import { gql } from '@apollo/client';

export const GET_STUDENTS_BY_GROUP = gql`
  query StudentsByGroup($groupId: ID!) {
    students(groupId: $groupId) {
      id
      name
      russianName
      isActive
    }
  }
`;
