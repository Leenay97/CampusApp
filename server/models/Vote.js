import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
export const Vote = sequelize.define('Vote', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'FINISHED'),
    allowNull: false,
    defaultValue: 'DRAFT',
  },
});
