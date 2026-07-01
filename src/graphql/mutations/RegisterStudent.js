import { gql } from '@apollo/client';

export const REGISTER_STUDENT = gql`
  mutation RegisterStudent(
    $token: String!
    $id: ID!
    $name: String!
    $login: String!
    $password: String!
    $confirmPassword: String!
  ) {
    registerStudent(
      token: $token
      id: $id
      login: $login
      name: $name
      password: $password
      confirmPassword: $confirmPassword
    ) {
      token
      user {
        id
        name
        userLevel
      }
    }
  }
`;
