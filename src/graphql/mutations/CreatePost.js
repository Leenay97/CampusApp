import { gql } from '@apollo/client';

export const CREATE_POST = gql`
  mutation CreatePost($text: String!, $title: String!) {
    createPost(text: $text, title: $title) {
      text
      title
    }
  }
`;
