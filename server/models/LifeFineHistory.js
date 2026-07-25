import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const LifeFineHistory = sequelize.define(
  'LifeFineHistory',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    indexes: [{ unique: true, fields: ['studentId', 'date'] }],
  },
);
