import { sequelize } from '../config/database.js';
import { User } from './User.js';
import { Group } from './Group.js';
import { Workshop } from './Workshop.js';
import { Season } from './Season.js';
import { Place } from './Place.js';
import { Schedule } from './Schedule.js';
import { TechnicalData } from './TechnicalData.js';
import { IpodPair } from './IpodPair.js';
import { IpodMatch } from './IpodMatch.js';
import { IpodTournament } from './IpodTournament.js';
import { House } from './House.js';
import { HouseGradeHistory } from './HouseGradeHistory.js';
import { Post } from './Post.js';
import { Class } from './Class.js';
import { Lesson } from './Lesson.js';
import { PushSubscription } from './PushSubscription.js';
import { Message } from './Message.js';
import { Vote } from './Vote.js';
import { VoteOption } from './VoteOption.js';
import { ArchivedSeason } from './ArchivedSeason.js';
import { ArchivedGroup } from './ArchivedGroup.js';
import { ArchivedWorkshop } from './ArchivedWorkshop.js';
import { ArchivedSporttime } from './ArchivedSporttime.js';
import { CoinTransaction } from './CoinTransaction.js';
import { LifeFineHistory } from './LifeFineHistory.js';
import { MazeRunnerEvent } from './MazeRunnerEvent.js';
import { MazeRunnerAttempt } from './MazeRunnerAttempt.js';

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

House.hasMany(User, { foreignKey: 'houseId', as: 'users' });
User.belongsTo(House, { foreignKey: 'houseId', as: 'house' });

House.hasMany(HouseGradeHistory, { foreignKey: 'houseId', as: 'gradeHistory' });
HouseGradeHistory.belongsTo(House, { foreignKey: 'houseId', as: 'house' });

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

User.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Class.hasMany(User, { foreignKey: 'classId', as: 'students' });

Class.belongsTo(Place, { foreignKey: 'placeId', as: 'place' });

// Ассоциации Lesson
Class.hasMany(Lesson, { foreignKey: 'classId', as: 'lessons' });
Lesson.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

// Учитель урока — тот, кто его закрыл
Lesson.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
User.hasMany(Lesson, { foreignKey: 'teacherId', as: 'taughtLessons' });

Season.hasMany(Lesson, { foreignKey: 'seasonId', as: 'lessons' });
Lesson.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

Message.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
User.hasMany(Message, { foreignKey: 'authorId', as: 'messages' });

Message.belongsTo(Message, { foreignKey: 'replyToId', as: 'replyTo' });

User.hasMany(Post, {
  foreignKey: 'authorId',
  as: 'posts',
});

Post.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
});

Vote.hasMany(VoteOption, { foreignKey: 'voteId', as: 'options' });
VoteOption.belongsTo(Vote, { foreignKey: 'voteId', as: 'vote' });

VoteOption.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

Season.hasMany(Vote, { foreignKey: 'seasonId', as: 'votes' });
Vote.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

// Ассоциации архива сезонов
ArchivedSeason.hasMany(ArchivedGroup, { foreignKey: 'archivedSeasonId', as: 'groups' });
ArchivedGroup.belongsTo(ArchivedSeason, { foreignKey: 'archivedSeasonId', as: 'season' });

ArchivedSeason.hasMany(ArchivedWorkshop, { foreignKey: 'archivedSeasonId', as: 'workshops' });
ArchivedWorkshop.belongsTo(ArchivedSeason, { foreignKey: 'archivedSeasonId', as: 'season' });

ArchivedSeason.hasMany(ArchivedSporttime, { foreignKey: 'archivedSeasonId', as: 'sporttimes' });
ArchivedSporttime.belongsTo(ArchivedSeason, { foreignKey: 'archivedSeasonId', as: 'season' });

// Ассоциации CoinTransaction
User.hasMany(CoinTransaction, { foreignKey: 'studentId', as: 'coinTransactions' });
CoinTransaction.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
CoinTransaction.belongsTo(User, { foreignKey: 'counterpartyId', as: 'counterparty' });

// Ассоциации LifeFineHistory
User.hasMany(LifeFineHistory, { foreignKey: 'studentId', as: 'lifeFineHistory' });
LifeFineHistory.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

// Ассоциации MazeRunnerAttempt
Group.hasOne(MazeRunnerAttempt, { foreignKey: 'groupId', as: 'mazeRunnerAttempt' });
MazeRunnerAttempt.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

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
  HouseGradeHistory,
  Post,
  Class,
  Lesson,
  PushSubscription,
  Message,
  Vote,
  VoteOption,
  IpodPair,
  IpodMatch,
  IpodTournament,
  ArchivedSeason,
  ArchivedGroup,
  ArchivedWorkshop,
  ArchivedSporttime,
  CoinTransaction,
  LifeFineHistory,
  MazeRunnerEvent,
  MazeRunnerAttempt,
};
