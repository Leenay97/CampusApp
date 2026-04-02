import { gql } from '@apollo/client';

export const CREATE_CLASS = gql`
  mutation CreateClass($name: String!, $placeId: ID!, $teacherIds: [ID!]!) {
    createClass(name: $name, placeId: $placeId, teacherIds: $teacherIds) {
      id
      name
      place {
        id
        name
      }
      teachers {
        id
        name
      }
    }
  }
`;
