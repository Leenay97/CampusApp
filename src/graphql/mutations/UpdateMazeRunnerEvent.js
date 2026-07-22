import { gql } from '@apollo/client';

export const UPDATE_MAZE_RUNNER_EVENT = gql`
  mutation UpdateMazeRunnerEvent(
    $code: String
    $isCyclic: Boolean
    $codeword: String
    $isActive: Boolean
  ) {
    updateMazeRunnerEvent(
      code: $code
      isCyclic: $isCyclic
      codeword: $codeword
      isActive: $isActive
    ) {
      id
      code
      isCyclic
      codeword
      isActive
    }
  }
`;
