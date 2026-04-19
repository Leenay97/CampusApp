import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($login: String!, $password: String!) {
    login(login: $login, password: $password) {
      token
      user {
        id
        russianName
        coins
        group {
          id
          name
        }
        userLevel
        photoUrl
        workshops {
          id
        }
        name
      }
    }
  }
`;
