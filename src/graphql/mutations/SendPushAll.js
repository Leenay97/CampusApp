import { gql } from '@apollo/client';

export const SEND_PUSH_ALL = gql`
  mutation SendPushToAll($title: String!, $body: String!, $url: String!) {
    sendPushToAll(title: $title, body: $body, url: $url)
  }
`;
