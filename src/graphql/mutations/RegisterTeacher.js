import { gql } from '@apollo/client';

export const REGISTER_TEACHER = gql`
  mutation RegisterTeacher(
    $token: String!
    $id: ID!
    $login: String!
    $password: String!
    $confirmPassword: String!
  ) {
    registerTeacher(
      token: $token
      id: $id
      login: $login
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
