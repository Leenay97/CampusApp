export type Teacher = {
  id: string;
  name: string;
  photoUrl?: string;
  group?: Record<string, string>;
};

export type Group = {
  id: string;
  name: string;
  teachers: User[];
  teacherIds: string[];
  users: Record<string, string>;
  points: number;
  places: string;
  rubbers: number;
};

export type GroupInput = {
  name: string;
  teacherIds: string[];
};

export type Workshop = {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  teacher: Teacher;
  students: User[];
  maxStudents: number;
  maxAge?: number;
  place: Pick<Place, 'name' | 'id'>;
  isClosed: boolean;
  date: Date;
};

export type Place = {
  id: string;
  name: string;
  isReserved: boolean;
  isTeamPlace: boolean;
  color: string;
};

export type RegisterStudentResponse = {
  registerStudent: {
    token: string;
    user: User;
  };
  errors: string;
};

export type RegisterStudentWithExistingAccountResponse = {
  registerStudentWithExistingAccount: {
    token: string;
    user: User;
  };
  errors: string;
};

export type ReactionCount = {
  emoji: string;
  count: number;
};

export type Post = {
  id: string;
  text: string;
  title: string;
  createdAt: string;
  author: User;
  reactions?: ReactionCount[];
  myReaction?: string | null;
  isPinned?: boolean;
};

export type Season = {
  id: string;
  number: string;
  year: string;
  isActive: boolean;
  isArchived: boolean;
  groups?: Group[];
};

export type House = {
  number: string;
  id: string;
  grade?: number;
  users?: Pick<User, 'id' | 'name' | 'russianName' | 'group'>[];
};

export type HouseGradeHistoryEntry = {
  id: string;
  date: string;
  grade: number;
  house: House;
};

export type LifeFineHistoryEntry = {
  id: string;
  date: string;
  count: number;
  student: User;
};

export type User = {
  id: string;
  name: string;
  russianName?: string;
  photoUrl?: string;
  login?: string;
  coins: number;
  userLevel: UserLevel;
  group?: Group;
  isActive: boolean;
  lives: number;
  house?: House;
  class: Class;
  englishLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  birthday?: string;
};

export type CoinTransaction = {
  id: string;
  amount: number;
  reason?: string | null;
  counterparty?: Pick<User, 'id' | 'name'> | null;
  createdAt: string;
};

export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export enum UserLevel {
  Admin = 'ADMIN',
  Teacher = 'TEACHER',
  Student = 'STUDENT',
}

export type Schedule = {
  time: string;
  activity: string;
  icon?: string;
};

export type ScannerError = Error & {
  name: string;
  message: string;
};

export type Class = {
  id: string;
  name: string;
  place: Place;
  level: number;
};

export type MessageType = 'TEXT' | 'STICKER';

export type MessageReplyPreview = {
  id: string;
  text: string;
  type?: MessageType;
  author: Pick<User, 'id' | 'name'>;
};

export type Message = {
  id: string;
  groupId: string;
  text: string;
  type?: MessageType;
  author: User;
  createdAt: string;
  pending?: boolean;
  replyToId?: string | null;
  replyTo?: MessageReplyPreview | null;
  reactions?: ReactionCount[];
  myReaction?: string | null;
};

export type VoteStatus = 'DRAFT' | 'ACTIVE' | 'FINISHED';

export type Vote = {
  id: string;
  title: string;
  status: VoteStatus;
  options: VoteOption[];
  votedOptionId?: string | null;
};

export type VoteOption = {
  id: string;
  name: string;
  votesNumber: number;
  groupId?: string | null;
  group?: Group | null;
};

export type LoadingType = 'ERROR' | 'SUCCESS' | 'LOADING' | 'NONE';

export type IpodPair = {
  id: string;
  name: string;
  creatorId?: string | null;
  students: User[];
};

export type IpodMatch = {
  id: string;
  round: number;
  date: string;
  pairs: IpodPair[];
  winner?: IpodPair | null;
};

export type IpodRoundName = {
  round: number;
  name: string;
};

export type MazeRunnerEvent = {
  id: string;
  code: string | null;
  isCyclic: boolean;
  codeword: string | null;
  isActive: boolean;
};

export type MazeRunnerResult = {
  groupId: string;
  groupName: string;
  isSolved: boolean;
  solvedAt: string | null;
};

export type MazeRunnerStatus = {
  isActive: boolean;
  codeLength: number | null;
  isSolved: boolean;
  lockedUntil: string | null;
  codeword: string | null;
};

export type IpodTournament = {
  seasonId: string;
  currentRound: number;
  roundNames: IpodRoundName[];
};
