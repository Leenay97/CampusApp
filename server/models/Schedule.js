import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
export const Schedule = sequelize.define('Schedule', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  dayName: { type: DataTypes.STRING, allowNull: false },
  schedule: { type: DataTypes.JSONB, allowNull: false },
});
