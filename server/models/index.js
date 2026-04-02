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
import { Post } from './Post.js';
import { Class } from './Class.js';

// Сначала определите все ассоциации
// Ассоциации Season
Season.hasMany(Group, { foreignKey: 'seasonId', as: 'groups' });
Group.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

Season.hasMany(Workshop, { foreignKey: 'seasonId', as: 'workshops' });
Workshop.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

Season.hasMany(Class, { foreignKey: 'seasonId', as: 'classes' });
Class.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

Season.hasMany(User, { foreignKey: 'seasonId', as: 'users' });
User.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

// Ассоциации Group
Group.hasMany(User, { foreignKey: 'groupId', as: 'users' });
User.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

Group.belongsTo(Place, { foreignKey: 'placeId', as: 'place' });
Place.hasOne(Group, { foreignKey: 'placeId', as: 'group' });

// Ассоциации Workshop
Workshop.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
User.hasMany(Workshop, { foreignKey: 'teacherId', as: 'teachingWorkshops' });

Workshop.belongsTo(Place, { foreignKey: 'placeId', as: 'place' });
Place.hasOne(Workshop, { foreignKey: 'placeId', as: 'workshop' });

// Many-to-many ассоциации User-Workshop
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

// Ассоциации Ipod
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

// Ассоциации House
House.hasMany(User, { foreignKey: 'houseId', as: 'users' });
User.belongsTo(House, { foreignKey: 'houseId', as: 'house' });

// Ассоциации Class - ВАЖНО: порядок имеет значение!
// Сначала связь Teacher <-> Class (many-to-many)
User.belongsToMany(Class, {
  through: 'TeacherClasses',
  as: 'taughtClasses',
  foreignKey: 'userId',
  otherKey: 'classId',
});

Class.belongsToMany(User, {
  through: 'TeacherClasses',
  as: 'teachers',
  foreignKey: 'classId',
  otherKey: 'userId',
});

// Затем связь Student -> Class (many-to-one)
User.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Class.hasMany(User, { foreignKey: 'classId', as: 'students' });

// Ассоциация Class-Place
Class.belongsTo(Place, { foreignKey: 'placeId', as: 'place' });

export {
  sequelize,
  User,
  Group,
  Workshop,
  Season,
  Place,
  Schedule,
  TechnicalData,
  House,
  Post,
  Class,
};
