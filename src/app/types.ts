type Teacher = {
  id: string;
  name: string;
  photoUrl?: string;
  group?: Record<string, string>;
};

type Group = {
  id: string;
  name: string;
  users: Record<string, string>;
  points: number;
};
