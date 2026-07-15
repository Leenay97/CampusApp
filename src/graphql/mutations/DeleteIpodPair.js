import { gql } from '@apollo/client';

export const DELETE_IPOD_PAIR = gql`
  mutation DeleteIpodPair($id: ID!) {
    deleteIpodPair(id: $id) {
      id
    }
  }
`;
