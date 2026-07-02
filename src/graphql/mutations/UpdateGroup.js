import { gql } from '@apollo/client';

export const UPDATE_GROUP = gql`
  mutation UpdateGroup(
    $id: ID!
    $amount: Int
    $rubbersAmount: Int
    $places: String
    $teacherIds: [ID]
    $name: String
  ) {
    updateGroup(
      id: $id
      amount: $amount
      rubbersAmount: $rubbersAmount
      places: $places
      teacherIds: $teacherIds
      name: $name
    ) {
      name
      points
      places
      rubbers
    }
  }
`;
