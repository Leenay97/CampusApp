import { gql } from '@apollo/client';

export const JOIN_WORKSHOP = gql`
  mutation JoinWorkshop($studentId: ID!, $workshopId: ID!, $isSport: Boolean) {
    joinWorkshop(studentId: $studentId, workshopId: $workshopId, isSport: $isSport) {
      id
      name
      description
      placeId
      maxStudents
    }
  }
`;
