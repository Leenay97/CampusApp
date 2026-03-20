import { gql } from '@apollo/client';

export const GET_WORKSHOPS = gql`
  query GetWorkshops($isSport: Boolean) {
    workshops(isSport: $isSport) {
      id
      name
      description
      date
      teacher {
        name
      }
      students {
        id
        name
      }
      place {
        id
        name
      }
      maxStudents
      isClosed
    }
  }
`;
