export type Workshop = {
  teacher: string;
  name: string;
  description?: string;
  studentAmount: number;
  maxStudentAmount: number;
  place: string;
};

export type WorkshopCounterProps = {
  number: number;
  maxNumber: number;
};
