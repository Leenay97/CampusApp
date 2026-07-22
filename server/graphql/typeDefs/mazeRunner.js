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

  extend type Query {
    mazeRunnerEvent: MazeRunnerEvent
    mazeRunnerStatus: MazeRunnerStatus!
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
