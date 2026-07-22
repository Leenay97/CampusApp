import { gql } from '@apollo/client';

export const CREATE_STUDENT = gql`
  mutation CreateStudent($russianName: String!, $groupId: ID!, $birthday: String) {
    createStudent(russianName: $russianName, groupId: $groupId, birthday: $birthday) {
      name
    }
  }
`;
