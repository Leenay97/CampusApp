export type Teacher = {
  id: string;
  name: string;
  photoUrl?: string;
  group?: Record<string, string>;
};

export type Group = {
  id: string;
  name: string;
  teacherIds: string[];
  users: Record<string, string>;
  points: number;
  places: string;
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
};

export type Place = {
  id: string;
  name: string;
  isReserved: boolean;
  isTeamPlace: boolean;
  color: string;
};

export type RegisterStudentResponse = {
  data?: {
    registerStudent: {
      token: string;
      user: {
        id: string;
        name: string;
        login: string;
        userLevel: string;
        isActive: boolean;
      };
    };
  };
};

export type Season = {
  id: string;
  number: string;
  year: string;
  isActive: boolean;
  isArchived: boolean;
};

export type User = {
  id: string;
  name: string;
  russianName?: string;
  coins: number;
  userLevel: UserLevel;
  group?: Group;
  isActive: boolean;
  lives: number;
};

export enum UserLevel {
  Admin = 'ADMIN',
  Teacher = 'TEACHER',
  Student = 'STUDENT',
}

export type Schedule = {
  time: string;
  activity: string;
};

export type ScannerError = Error & {
  name: string;
  message: string;
};

export type LoadingType = 'ERROR' | 'SUCCESS' | 'LOADING' | 'NONE';
