import { User } from '@/app/types';

export type Workshop = {
  teacher: string;
  joined?: boolean;
  name: string;
  description?: string;
  students: Partial<User>[];
  maxStudentAmount: number;
  maxAge?: number;
  place: string;
  toClose?: boolean;
  isClosed?: boolean;
  noButtons?: boolean;
  isSport?: boolean;
  date?: Date;
  handleJoin?: () => void;
};

export type WorkshopCounterProps = {
  number: number;
  maxNumber: number;
};
