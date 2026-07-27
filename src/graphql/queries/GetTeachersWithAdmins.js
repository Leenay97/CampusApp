import { gql } from '@apollo/client';

export const GET_TEACHERS_WITH_ADMINS = gql`
  query GetTeachersWithAdmins {
    teachers(includeAdmins: true) {
      id
      name
      userLevel
      group {
        id
        name
      }
    }
  }
`;
