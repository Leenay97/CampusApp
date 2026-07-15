import { gql } from '@apollo/client';

export const CREATE_IPOD_PAIR = gql`
  mutation CreateIpodPair($name: String!, $studentIds: [ID!]!, $seasonId: ID!) {
    createIpodPair(name: $name, studentIds: $studentIds, seasonId: $seasonId) {
      id
      name
      students {
        id
        name
        russianName
      }
    }
  }
`;
