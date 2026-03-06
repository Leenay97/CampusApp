import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
export const Workshop = sequelize.define('Workshop', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  maxStudents: { type: DataTypes.INTEGER, allowNull: true },
  teacherId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  isClosed: { type: DataTypes.BOOLEAN, defaultValue: false },
});
