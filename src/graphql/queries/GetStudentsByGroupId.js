import { gql } from '@apollo/client';

export const GET_STUDENTS_BY_GROUP_ID = gql`
  query GetStudentsByGroupId($groupId: ID!) {
    usersByGroup(groupId: $groupId) {
      id
      name
      russianName
      isActive
      coins
      group {
        id
        name
      }
      workshops {
        id
        name
      }
      house {
        id
        number
      }
      class {
        id
        name
      }
      englishLevel
    }
  }
`;
