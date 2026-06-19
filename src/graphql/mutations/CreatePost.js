import { gql } from '@apollo/client';

export const CREATE_POST = gql`
  mutation CreatePost($text: String!, $title: String!, $authorId: ID!) {
    createPost(text: $text, title: $title, authorId: $authorId) {
      text
      title
      createdAt
      authorId
    }
  }
`;
