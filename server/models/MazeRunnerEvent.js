import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Единственная запись настроек ивента «Maze Runner» — код, кодовое слово-приз
// и переключатель «запущен» (по аналогии с TechnicalData.isElectionShown).
export const MazeRunnerEvent = sequelize.define('MazeRunnerEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isCyclic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  codeword: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});
