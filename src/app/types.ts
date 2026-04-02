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
    user: {
      id: string;
      name: string;
      login: string;
      userLevel: string;
      isActive: boolean;
    };
  };
};

export type Post = {
  id: string;
  text: string;
  title: string;
};

export type Season = {
  id: string;
  number: string;
  year: string;
  isActive: boolean;
  isArchived: boolean;
};

export type House = {
  number: string;
  id: string;
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
  house?: House;
  class: Class;
  englishLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
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

export type LoadingType = 'ERROR' | 'SUCCESS' | 'LOADING' | 'NONE';
