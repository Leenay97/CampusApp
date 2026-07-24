import { CREATE_GROUP } from './CreateGroup';
import { CREATE_TEACHER } from './CreateTeacher';
import { DELETE_USER } from './DeleteUser';
import { DELETE_UNREGISTERED_STUDENTS } from './DeleteUnregisteredStudents';
import { DELETE_GROUP } from './DeleteGroup';
import { UPDATE_GROUP } from './UpdateGroup';
import { CREATE_WORKSHOP } from './CreateWorkshop';
import { UPDATE_WORKSHOP } from './UpdateWorkshop';
import { CREATE_SEASON } from './CreateSeason';
import { ACTIVATE_SEASON } from './ActivateSeason';
import { ARCHIVE_SEASON } from './ArchiveSeason';
import { REGISTER_TEACHER } from './RegisterTeacher';
import { LOGIN } from './Login';
import { CREATE_STUDENT } from './CreateStudent';
import { REGISTER_STUDENT } from './RegisterStudent';
import { REGISTER_STUDENT_WITH_EXISTING_ACCOUNT } from './RegisterStudentWithExistingAccount';
import { CREATE_PLACE } from './CreatePlace';
import { UPDATE_SCHEDULE } from './UpdateSchedule';
import { JOIN_WORKSHOP } from './JoinWorkshop';
import { CLOSE_WORKSHOP } from './CloseWorkshop';
import { UPDATE_TECHNICAL_DATA } from './UpdateTechnicalData';
import { TRANSFER_COINS } from './TransferCoins';
import { TRANSFER_COINS_TO_GROUP } from './TransferCoinsToGroup';
import { FINE_USER } from './FineUser';
import { CREATE_HOUSE } from './CreateHouse';
import { UPDATE_USER } from './UpdateUser';
import { UPDATE_HOUSE } from './UpdateHouse';
import { RESET_HOUSE_GRADES } from './ResetHouseGrades';
import { CREATE_POST } from './CreatePost';
import { CREATE_CLASS } from './CreateClass';
import { UPDATE_CLASS } from './UpdateClass';
import { UPLOAD_AVATAR } from './UploadAvatar';
import { UPLOAD_POST_IMAGE } from './UploadPostImage';
import { DELETE_POST_IMAGE } from './DeletePostImage';
import { SEND_PUSH_ALL } from './SendPushAll';
import { SEND_MESSAGE } from './SendMessage';
import { UPDATE_POST } from './UpdatePost';
import { DELETE_POST } from './DeletePost';
import { SET_POST_REACTION } from './SetPostReaction';
import { SET_MESSAGE_REACTION } from './SetMessageReaction';
import { CREATE_VOTE } from './CreateVote';
import { CAST_VOTE } from './CastVote';
import { SET_VOTE_STATUS } from './SetVoteStatus';
import { DELETE_VOTE } from './DeleteVote';
import { GENERATE_PASSWORD_RESET_LINK } from './GeneratePasswordResetLink';
import { RESET_PASSWORD } from './ResetPassword';
import { CHANGE_PASSWORD } from './ChangePassword';
import { CREATE_IPOD_PAIR } from './CreateIpodPair';
import { DELETE_IPOD_PAIR } from './DeleteIpodPair';
import { CREATE_IPOD_MATCH } from './CreateIpodMatch';
import { SET_IPOD_MATCH_WINNER } from './SetIpodMatchWinner';
import { ADVANCE_IPOD_ROUND } from './AdvanceIpodRound';
import { SET_IPOD_ROUND_NAME } from './SetIpodRoundName';
import { SET_IPOD_MATCH_DATE } from './SetIpodMatchDate';
import { UPDATE_MAZE_RUNNER_EVENT } from './UpdateMazeRunnerEvent';
import { SUBMIT_MAZE_RUNNER_CODE } from './SubmitMazeRunnerCode';

export const mutations = {
  UPDATE_GROUP,
  CREATE_GROUP,
  CREATE_TEACHER,
  DELETE_USER,
  DELETE_UNREGISTERED_STUDENTS,
  DELETE_GROUP,
  CREATE_WORKSHOP,
  UPDATE_WORKSHOP,
  CREATE_SEASON,
  ACTIVATE_SEASON,
  ARCHIVE_SEASON,
  REGISTER_TEACHER,
  LOGIN,
  CREATE_STUDENT,
  REGISTER_STUDENT,
  REGISTER_STUDENT_WITH_EXISTING_ACCOUNT,
  CREATE_PLACE,
  UPDATE_SCHEDULE,
  JOIN_WORKSHOP,
  CLOSE_WORKSHOP,
  UPDATE_TECHNICAL_DATA,
  TRANSFER_COINS,
  TRANSFER_COINS_TO_GROUP,
  FINE_USER,
  CREATE_HOUSE,
  UPDATE_USER,
  UPDATE_HOUSE,
  RESET_HOUSE_GRADES,
  CREATE_POST,
  UPDATE_POST,
  CREATE_CLASS,
  UPDATE_CLASS,
  UPLOAD_AVATAR,
  UPLOAD_POST_IMAGE,
  DELETE_POST_IMAGE,
  SEND_PUSH_ALL,
  SEND_MESSAGE,
  DELETE_POST,
  SET_POST_REACTION,
  SET_MESSAGE_REACTION,
  CREATE_VOTE,
  CAST_VOTE,
  SET_VOTE_STATUS,
  DELETE_VOTE,
  GENERATE_PASSWORD_RESET_LINK,
  RESET_PASSWORD,
  CHANGE_PASSWORD,
  CREATE_IPOD_PAIR,
  DELETE_IPOD_PAIR,
  CREATE_IPOD_MATCH,
  SET_IPOD_MATCH_WINNER,
  ADVANCE_IPOD_ROUND,
  SET_IPOD_ROUND_NAME,
  SET_IPOD_MATCH_DATE,
  UPDATE_MAZE_RUNNER_EVENT,
  SUBMIT_MAZE_RUNNER_CODE,
};
export default mutations;
