import { gql } from '@apollo/client';

export const SEND_PUSH_STAFF = gql`
  mutation SendPushToStaff($title: String!, $body: String!, $url: String!) {
    sendPushToStaff(title: $title, body: $body, url: $url)
  }
`;
