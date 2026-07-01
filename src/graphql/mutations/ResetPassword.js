import { gql } from '@apollo/client';

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $password: String!, $confirmPassword: String!) {
    resetPassword(token: $token, password: $password, confirmPassword: $confirmPassword)
  }
`;
