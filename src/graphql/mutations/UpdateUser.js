import { gql } from '@apollo/client';

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String, $russianName: String, $groupId: ID, $houseId: ID) {
    updateUser(
      id: $id
      name: $name
      russianName: $russianName
      groupId: $groupId
      houseId: $houseId
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
