import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export const PushSubscription = sequelize.define(
  'PushSubscription',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endpoint: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    p256dh: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    auth: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);
