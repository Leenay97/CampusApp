import { gql } from '@apollo/client';

export const CREATE_STUDENT = gql`
  mutation CreateStudent($russianName: String!, $groupId: ID!) {
    createStudent(russianName: $russianName, groupId: $groupId) {
      name
    }
  }
`;
