import { gql } from '@apollo/client';

export const CREATE_TEACHER = gql`
  mutation CreateTeacher($name: String!) {
    createTeacher(name: $name) {
      name
    }
  }
`;
