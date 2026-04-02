import { gql } from '@apollo/client';

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $name: String
    $russianName: String
    $groupId: ID
    $houseId: ID
    $classId: ID
    $coins: Int
    $englishLevel: String
  ) {
    updateUser(
      id: $id
      name: $name
      russianName: $russianName
      groupId: $groupId
      houseId: $houseId
      classId: $classId
      coins: $coins
      englishLevel: $englishLevel
    ) {
      id
      russianName
      coins
      group {
        id
        name
      }
      userLevel
      workshops {
        id
      }
      name
      houseId
    }
  }
`;
