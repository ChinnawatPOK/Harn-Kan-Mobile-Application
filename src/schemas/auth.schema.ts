export type User = {
  id: string;
  name: string;
  phoneNumber: string;
};

export type LoginResult = {
  accessToken: string;
  tokenType: string;
  user: User;
};

export type RegisterResult = {
  user: User;
};

export type RegisterInput = {
  name: string;
  phoneNumber: string;
  password: string;
};

export type LoginInput = {
  phoneNumber: string;
  password: string;
};
