import { gql } from 'apollo-server-express';

export const mazeRunnerTypeDefs = gql`
  # Полные настройки ивента, видны только админу
  type MazeRunnerEvent {
    id: ID!
    code: String
    isCyclic: Boolean!
    codeword: String
    isActive: Boolean!
  }

  # Статус ивента для группы текущего пользователя (студент/учитель) —
  # код в открытом виде не отдаём
  type MazeRunnerStatus {
    isActive: Boolean!
    codeLength: Int
    isSolved: Boolean!
    lockedUntil: String
    codeword: String
  }

  # Итог текущего запуска по каждой группе активного сезона
  type MazeRunnerResult {
    groupId: ID!
    groupName: String!
    isSolved: Boolean!
    solvedAt: String
  }

  extend type Query {
    mazeRunnerEvent: MazeRunnerEvent
    mazeRunnerStatus: MazeRunnerStatus!
    mazeRunnerResults: [MazeRunnerResult!]!
  }

  extend type Mutation {
    updateMazeRunnerEvent(
      code: String
      isCyclic: Boolean
      codeword: String
      isActive: Boolean
    ): MazeRunnerEvent
    submitMazeRunnerCode(code: String!): MazeRunnerStatus!
  }
`;
