import { gql } from '@apollo/client';

export const GET_MAZE_RUNNER_STATUS = gql`
  query GetMazeRunnerStatus {
    mazeRunnerStatus {
      isActive
      codeLength
      isSolved
      lockedUntil
      codeword
    }
  }
`;
