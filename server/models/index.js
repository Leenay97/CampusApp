import { sequelize } from '../config/database.js';
import { User } from './User.js';
import { Group } from './Group.js';
import { Workshop } from './Workshop.js';

Group.hasMany(User, { foreignKey: 'groupId', as: 'users' });
User.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

User.belongsToMany(Workshop, {
  through: 'UserWorkshop',
  as: 'workshops',
  foreignKey: 'userId',
});

Workshop.belongsToMany(User, {
  through: 'UserWorkshop',
  as: 'users',
  foreignKey: 'workshopId',
});

export { sequelize, User, Group, Workshop };
