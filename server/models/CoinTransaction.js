import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const CoinTransaction = sequelize.define('CoinTransaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentId: { type: DataTypes.UUID, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  counterpartyId: { type: DataTypes.UUID, allowNull: true },
  reason: { type: DataTypes.STRING, allowNull: true },
});
