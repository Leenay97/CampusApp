import { gql } from '@apollo/client';

export const UPDATE_WORKSHOP = gql`
  mutation UpdateWorkshop(
    $id: ID!
    $name: String
    $description: String
    $placeId: ID
    $teacherId: ID
    $maxStudents: Int
    $maxAge: Int
    $date: String
    $image: String
  ) {
    updateWorkshop(
      id: $id
      name: $name
      description: $description
      placeId: $placeId
      teacherId: $teacherId
      maxStudents: $maxStudents
      maxAge: $maxAge
      date: $date
      image: $image
    ) {
      id
      name
      description
      placeId
      maxStudents
      image
    }
  }
`;
