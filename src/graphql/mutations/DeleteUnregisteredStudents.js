import { gql } from '@apollo/client';

export const DELETE_UNREGISTERED_STUDENTS = gql`
  mutation DeleteUnregisteredStudents($groupId: ID!) {
    deleteUnregisteredStudents(groupId: $groupId) {
      id
    }
  }
`;
