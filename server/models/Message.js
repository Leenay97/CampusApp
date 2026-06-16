import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  groupId: {
    type: DataTypes.UUID,
  },
});
