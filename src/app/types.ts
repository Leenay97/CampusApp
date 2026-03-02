type Teacher = {
  id: string;
  name: string;
  photoUrl?: string;
  group?: Record<string, string>;
};

type Group = {
  id: string;
  name: string;
  teacherIds: string[];
  users: Record<string, string>;
  points: number;
};

type GroupInput = {
  name: string;
  teacherIds: string[];
};

type Workshop = {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  teacher: Teacher;
  students: Record<string, string>[];
  maxStudents: number;
  place: string;
  isClosed: boolean;
};

type Season = {
  id: string;
  number: string;
  year: string;
  isActive: boolean;
  isArchived: boolean;
};

type User = {
  id: string;
  name: string;
  russianName?: string;
  coins: number;
  userLevel: 'ADMIN' | 'TEACHER' | 'STUDENT';
  group?: Group;
};
