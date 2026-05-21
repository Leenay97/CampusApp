import { gql } from '@apollo/client';

export const CREATE_GROUP = gql`
  mutation CreateGroup($name: String!, $teacherIds: [ID!]!, $seasonId: ID!) {
    createGroup(name: $name, userIds: $teacherIds, seasonId: $seasonId) {
      name
    }
  }
`;
