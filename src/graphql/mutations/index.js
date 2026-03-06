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
};
export default mutations;
