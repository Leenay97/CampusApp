import { gql } from '@apollo/client';

export const UPLOAD_WORKSHOP_IMAGE = gql`
  mutation UploadWorkshopImage($file: Upload!) {
    uploadWorkshopImage(file: $file)
  }
`;
