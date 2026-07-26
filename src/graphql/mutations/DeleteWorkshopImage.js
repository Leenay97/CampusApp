import { gql } from '@apollo/client';

export const DELETE_WORKSHOP_IMAGE = gql`
  mutation DeleteWorkshopImage($url: String!) {
    deleteWorkshopImage(url: $url)
  }
`;
