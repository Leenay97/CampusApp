import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Прогресс одной группы по текущему запуску Maze Runner: блокировка ввода
// после неверного кода и факт решения — по одной записи на группу.
export const MazeRunnerAttempt = sequelize.define('MazeRunnerAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  lockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isSolved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  solvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});
