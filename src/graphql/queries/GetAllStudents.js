import { gql } from '@apollo/client';

export const GET_ALL_STUDENTS = gql`
  query AllStudents {
    students {
      id
      name
      russianName
      login
      isActive
      group {
        id
        name
      }
    }
  }
`;
