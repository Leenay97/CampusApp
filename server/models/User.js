import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
export const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  russianName: { type: DataTypes.STRING, allowNull: true },
  coins: { type: DataTypes.INTEGER, allowNull: true },
  photoUrl: { type: DataTypes.STRING, allowNull: true },
  userLevel: { type: DataTypes.STRING, allowNull: true },
});
