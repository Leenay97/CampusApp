import { sequelize } from '../config/database.js';
import { User } from './User.js';
import { Group } from './Group.js';
import { Workshop } from './Workshop.js';
import { Season } from './Season.js';

Season.hasMany(Group, { foreignKey: 'seasonId', as: 'groups' });
Group.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

Season.hasMany(Workshop, { foreignKey: 'seasonId', as: 'workshops' });
Workshop.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

Season.hasMany(User, { foreignKey: 'seasonId', as: 'users' });
User.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

Group.hasMany(User, { foreignKey: 'groupId', as: 'users' });
User.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

Workshop.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
User.hasMany(Workshop, { foreignKey: 'teacherId', as: 'teachingWorkshops' });

User.belongsToMany(Workshop, {
  through: 'UserWorkshop',
  as: 'attendingWorkshops',
  foreignKey: 'userId',
});

Workshop.belongsToMany(User, {
  through: 'UserWorkshop',
  as: 'students',
  foreignKey: 'workshopId',
});

export { sequelize, User, Group, Workshop, Season };
