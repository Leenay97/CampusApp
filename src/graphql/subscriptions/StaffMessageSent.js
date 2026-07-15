import { gql } from '@apollo/client';

export const STAFF_MESSAGE_SENT = gql`
  subscription OnStaffMessageSent {
    staffMessageSent {
      id
      text
      type
      createdAt
      author {
        id
        name
        userLevel
        photoUrl
      }
    }
  }
`;
