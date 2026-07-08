import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ArchivedWorkshop = sequelize.define('ArchivedWorkshop', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: true },
  teacher: { type: DataTypes.STRING, allowNull: true },
});
