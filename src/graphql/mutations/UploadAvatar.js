import { gql } from '@apollo/client';

export const UPLOAD_AVATAR = gql`
  mutation UploadAvatar($file: Upload!, $userId: ID!) {
    uploadAvatar(file: $file, userId: $userId) {
      id
      photoUrl
    }
  }
`;
