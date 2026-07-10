import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Проведённый урок английского: создаётся при закрытии, по одному в день на класс
export const Lesson = sequelize.define('Lesson', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  // Снимок присутствовавших студентов: [{ id, name }]
  students: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
});
