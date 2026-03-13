import { User } from '@/app/types';

export type Workshop = {
  teacher: string;
  name: string;
  description?: string;
  students: Partial<User>[];
  maxStudentAmount: number;
  maxAge?: number;
  place: string;
  toClose?: boolean;
  handleJoin?: () => void;
};

export type WorkshopCounterProps = {
  number: number;
  maxNumber: number;
};
