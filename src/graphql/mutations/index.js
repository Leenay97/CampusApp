import { CREATE_GROUP } from './CreateGroup';
import { CREATE_TEACHER } from './CreateTeacher';
import { DELETE_USER } from './DeleteUser';
import { DELETE_GROUP } from './DeleteGroup';
import { ADD_POINTS } from './AddPoints';
import { CREATE_WORKSHOP } from './CreateWorkshop';
import { CREATE_SEASON } from './CreateSeason';
import { ACTIVATE_SEASON } from './ActivateSeason';
import { REGISTER_TEACHER } from './RegisterTeacher';
import { LOGIN } from './Login';

export const mutations = {
  ADD_POINTS,
  CREATE_GROUP,
  CREATE_TEACHER,
  DELETE_USER,
  DELETE_GROUP,
  CREATE_WORKSHOP,
  CREATE_SEASON,
  ACTIVATE_SEASON,
  REGISTER_TEACHER,
  LOGIN,
};
export default mutations;
