import { gql } from '@apollo/client';

export const REGISTER_STUDENT_WITH_EXISTING_ACCOUNT = gql`
  mutation RegisterStudentWithExistingAccount(
    $token: String!
    $login: String!
    $password: String!
  ) {
    registerStudentWithExistingAccount(token: $token, login: $login, password: $password) {
      token
      user {
        id
        name
        userLevel
      }
    }
  }
`;
