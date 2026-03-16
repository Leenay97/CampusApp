import { CREATE_GROUP } from './CreateGroup';
import { CREATE_TEACHER } from './CreateTeacher';
import { DELETE_USER } from './DeleteUser';
import { DELETE_GROUP } from './DeleteGroup';
import { UPDATE_GROUP } from './UpdateGroup';
import { CREATE_WORKSHOP } from './CreateWorkshop';
import { CREATE_SEASON } from './CreateSeason';
import { ACTIVATE_SEASON } from './ActivateSeason';
import { REGISTER_TEACHER } from './RegisterTeacher';
import { LOGIN } from './Login';
import { CREATE_STUDENT } from './CreateStudent';
import { REGISTER_STUDENT } from './RegisterStudent';
import { CREATE_PLACE } from './CreatePlace';
import { UPDATE_SCHEDULE } from './UpdateSchedule';
import { JOIN_WORKSHOP } from './JoinWorkshop';
import { CLOSE_WORKSHOP } from './CloseWorkshop';
import { UPDATE_TECHNICAL_DATA } from './UpdateTechnicalData';
import { TRANSFER_COINS } from './TransferCoins';
import { FINE_USER } from './FineUser';

export const mutations = {
  UPDATE_GROUP,
  CREATE_GROUP,
  CREATE_TEACHER,
  DELETE_USER,
  DELETE_GROUP,
  CREATE_WORKSHOP,
  CREATE_SEASON,
  ACTIVATE_SEASON,
  REGISTER_TEACHER,
  LOGIN,
  CREATE_STUDENT,
  REGISTER_STUDENT,
  CREATE_PLACE,
  UPDATE_SCHEDULE,
  JOIN_WORKSHOP,
  CLOSE_WORKSHOP,
  UPDATE_TECHNICAL_DATA,
  TRANSFER_COINS,
  FINE_USER,
};
export default mutations;
