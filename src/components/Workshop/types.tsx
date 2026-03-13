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
  handleJoin?: () => void;
};

export type WorkshopCounterProps = {
  number: number;
  maxNumber: number;
};
