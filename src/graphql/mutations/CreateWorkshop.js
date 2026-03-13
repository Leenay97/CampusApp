import { gql } from '@apollo/client';

export const CREATE_WORKSHOP = gql`
  mutation CreateWorkshop(
    $name: String!
    $description: String
    $placeId: ID
    $teacherId: ID
    $maxStudents: Int
    $maxAge: Int
    $type: String!
  ) {
    createWorkshop(
      name: $name
      description: $description
      placeId: $placeId
      teacherId: $teacherId
      maxStudents: $maxStudents
      maxAge: $maxAge
      type: $type
    ) {
      id
      name
      description
      placeId
      maxStudents
    }
  }
`;
