import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const IpodMatch = sequelize.define('IpodMatch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  ipodGroupIds: {
    type: DataTypes.ARRAY(DataTypes.STRING),
  },
});
