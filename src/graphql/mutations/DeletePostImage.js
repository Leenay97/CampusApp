import { gql } from '@apollo/client';

export const DELETE_POST_IMAGE = gql`
  mutation DeletePostImage($url: String!) {
    deletePostImage(url: $url)
  }
`;
