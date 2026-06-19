import { gql } from '@apollo/client';

export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $text: String!, $title: String!) {
    updatePost(id: $id, text: $text, title: $title) {
      text
      title
      createdAt
      authorId
    }
  }
`;
