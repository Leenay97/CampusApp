import { gql } from '@apollo/client';

export const GET_CLASSES = gql`
  query GetClasses {
    classes {
      id
      name
      teachers {
        id
        name
      }
      students {
        id
        name
        russianName
        group {
          id
          name
        }
      }
      place {
        id
        name
      }
    }
  }
`;
