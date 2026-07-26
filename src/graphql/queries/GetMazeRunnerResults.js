import { gql } from '@apollo/client';

export const GET_MAZE_RUNNER_RESULTS = gql`
  query GetMazeRunnerResults {
    mazeRunnerResults {
      groupId
      groupName
      isSolved
      solvedAt
    }
  }
`;
