import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Группа архивного сезона: составы хранятся снимками имён,
// потому что сами User после архивации отвязываются от сезона
export const ArchivedGroup = sequelize.define('ArchivedGroup', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  // [{ id, name }]
  teachers: { type: DataTypes.JSONB, allowNull: true },
  // [{ id, name, russianName }]
  students: { type: DataTypes.JSONB, allowNull: true },
});
