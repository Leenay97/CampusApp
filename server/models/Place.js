import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
export const Place = sequelize.define('Place', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  isReserved: { type: DataTypes.BOOLEAN, defaultValue: false },
  isTeamPlace: { type: DataTypes.BOOLEAN, defaultValue: false },
  color: { type: DataTypes.STRING, allowNull: true },
});
