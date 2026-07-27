import { User } from '@/app/types';

export type Workshop = {
  teacher: string;
  avatar?: string;
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
  registrationClosed?: boolean;
  isSport?: boolean;
  date?: Date;
  image?: string;
  handleJoin?: () => void;
  onEdit?: () => void;
};

export type WorkshopCounterProps = {
  number: number;
  maxNumber: number;
};
