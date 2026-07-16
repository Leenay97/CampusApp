import { gql } from '@apollo/client';

export const UPDATE_CLASS = gql`
  mutation UpdateClass(
    $id: ID!
    $name: String
    $placeId: ID
    $teacherIds: [ID!]
    $studentIds: [ID!]
  ) {
    updateClass(
      id: $id
      name: $name
      placeId: $placeId
      teacherIds: $teacherIds
      studentIds: $studentIds
    ) {
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
