import { gql } from '@apollo/client';

export const CREATE_CLASS = gql`
  mutation CreateClass($name: String!, $placeId: ID!, $teacherIds: [ID!]!, $studentIds: [ID!]) {
    createClass(name: $name, placeId: $placeId, teacherIds: $teacherIds, studentIds: $studentIds) {
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
      students {
        id
        name
      }
    }
  }
`;
