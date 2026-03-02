import { gql } from '@apollo/client';

export const CREATE_WORKSHOP = gql`
  mutation CreateWorkshop(
    $name: String!
    $description: String
    $place: String!
    $teacherId: ID!
    $maxStudents: Int!
  ) {
    createWorkshop(
      name: $name
      description: $description
      place: $place
      teacherId: $teacherId
      maxStudents: $maxStudents
    ) {
      id
      name
      description
      place
      maxStudents
    }
  }
`;
