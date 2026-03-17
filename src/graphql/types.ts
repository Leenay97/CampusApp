type UserGroup = {
  id: string;
  name: string;
  places: number;
};

type User = {
  id: string;
  name: string;
  group: UserGroup;
  russianName: string;
  coins: number;
  userLevel: number;
  lives: number;
};

export type GetUserResponse = {
  user: User;
};

export type GetUserVariables = {
  id: string;
};
