import { gql } from '@apollo/client';

export const UPLOAD_POST_IMAGE = gql`
  mutation UploadPostImage($file: Upload!) {
    uploadPostImage(file: $file)
  }
`;
