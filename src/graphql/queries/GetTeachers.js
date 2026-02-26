import { gql } from '@apollo/client';

export const GET_TEACHERS = gql`
  query GetTeachers {
    teachers {
      id
      name
      group {
        name
      }
    }
  }
`;
