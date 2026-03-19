import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const House = sequelize.define('House', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  grade: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});
