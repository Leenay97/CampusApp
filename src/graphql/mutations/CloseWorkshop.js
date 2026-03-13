import { gql } from '@apollo/client';

export const CLOSE_WORKSHOP = gql`
  mutation CloseWorkshop($studentIds: [ID!]!, $workshopId: ID!) {
    closeWorkshop(studentIds: $studentIds, workshopId: $workshopId) {
      id
      name
    }
  }
`;
