import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
export const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: true },
  russianName: { type: DataTypes.STRING, allowNull: true },
  coins: { type: DataTypes.INTEGER, allowNull: true },
  photoUrl: { type: DataTypes.STRING, allowNull: true },
  userLevel: { type: DataTypes.ENUM('STUDENT', 'TEACHER', 'ADMIN'), allowNull: true },
  login: { type: DataTypes.STRING, allowNull: true, unique: true },
  hashedPassword: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  lives: { type: DataTypes.INTEGER, allowNull: true },
});
