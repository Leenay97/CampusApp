import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const IpodPair = sequelize.define('IpodPair', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  studentIds: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  seasonId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  creatorId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
