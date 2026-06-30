import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
export const VoteOption = sequelize.define('VoteOption', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  votesNumber: { type: DataTypes.INTEGER, defaultValue: 0 },
  voteId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Votes',
      key: 'id',
    },
  },
});
