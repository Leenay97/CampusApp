import { gql } from '@apollo/client';

export const JOIN_WORKSHOP = gql`
  mutation JoinWorkshop($studentId: ID!, $workshopId: ID!) {
    joinWorkshop(studentId: $studentId, workshopId: $workshopId) {
      id
      name
      description
      placeId
      maxStudents
    }
  }
`;
