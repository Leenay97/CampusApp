import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const HouseGradeHistory = sequelize.define(
  'HouseGradeHistory',
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
    grade: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    indexes: [{ unique: true, fields: ['houseId', 'date'] }],
  },
);
