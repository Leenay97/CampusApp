import { gql } from '@apollo/client';

export const SUBMIT_MAZE_RUNNER_CODE = gql`
  mutation SubmitMazeRunnerCode($code: String!) {
    submitMazeRunnerCode(code: $code) {
      isActive
      codeLength
      isSolved
      lockedUntil
      codeword
    }
  }
`;
