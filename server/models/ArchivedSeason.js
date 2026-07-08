import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Снимок сезона на момент архивации
export const ArchivedSeason = sequelize.define('ArchivedSeason', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  number: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.STRING, allowNull: false },
  startDate: { type: DataTypes.DATE, allowNull: true },
  endDate: { type: DataTypes.DATE, allowNull: true },
});
