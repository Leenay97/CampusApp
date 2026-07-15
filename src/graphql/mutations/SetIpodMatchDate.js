import { gql } from '@apollo/client';

export const SET_IPOD_MATCH_DATE = gql`
  mutation SetIpodMatchDate($id: ID!, $date: String!) {
    setIpodMatchDate(id: $id, date: $date) {
      id
      date
    }
  }
`;
