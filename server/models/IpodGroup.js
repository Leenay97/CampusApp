import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const IpodGroup = sequelize.define('IpodGroup', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  studentIds: {
    type: DataTypes.ARRAY(DataTypes.STRING),
  },
  hasParticipated: {
    type: DataTypes.BOOLEAN,
  },
  songs: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
});
