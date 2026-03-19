import { sequelize } from '../config/database.js';
import { User } from './User.js';
import { Group } from './Group.js';
import { Workshop } from './Workshop.js';
import { Season } from './Season.js';
import { Place } from './Place.js';
import { Schedule } from './Schedule.js';
import { TechnicalData } from './TechnicalData.js';
import { IpodGroup } from './IpodGroup.js';
import { IpodMatch } from './IpodMatch.js';
import { House } from './House.js';

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

IpodGroup.hasMany(User);
User.belongsTo(IpodGroup);

IpodMatch.belongsToMany(IpodGroup, {
  through: 'Ipod',
  foreignKey: 'ipodGroup',
});

IpodGroup.belongsToMany(IpodMatch, {
  through: 'Ipod',
  foreignKey: 'ipodMatch',
});

Group.belongsTo(Place, { foreignKey: 'placeId', as: 'place' });
Place.hasOne(Group, { foreignKey: 'placeId', as: 'group' });

Workshop.belongsTo(Place, { foreignKey: 'placeId', as: 'place' });
Place.hasOne(Workshop, { foreignKey: 'placeId', as: 'workshop' });

House.hasMany(User, { foreignKey: 'houseId', as: 'users' });
User.belongsTo(House, { foreignKey: 'houseId', as: 'house' });

export { sequelize, User, Group, Workshop, Season, Place, Schedule, TechnicalData, House };
