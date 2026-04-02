import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
export const TechnicalData = sequelize.define('TechnicalData', {
  workshopValue: { type: DataTypes.INTEGER, allowNull: true },
  sportTimeValue: { type: DataTypes.INTEGER, allowNull: true },
  sportTimeStart: { type: DataTypes.TIME, allowNull: true },
  workshopStart: { type: DataTypes.TIME, allowNull: true },
  isRatingShown: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
});
