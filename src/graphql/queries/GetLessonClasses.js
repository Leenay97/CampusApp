import { gql } from '@apollo/client';

export const GET_LESSON_CLASSES = gql`
  query GetLessonClasses {
    classes {
      id
      name
      closedDates
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
