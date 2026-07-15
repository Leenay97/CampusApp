import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const IpodTournament = sequelize.define('IpodTournament', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  seasonId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  currentRound: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  roundNames: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
});
