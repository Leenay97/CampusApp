import { gql } from '@apollo/client';

export const GET_MAZE_RUNNER_EVENT = gql`
  query GetMazeRunnerEvent {
    mazeRunnerEvent {
      id
      code
      isCyclic
      codeword
      isActive
    }
  }
`;
