export type User = {
  id: string;
  name: string;
  phoneNumber?: string;
};

export type LoginResult = {
  token: string;
  user: User;
};

export type RegisterResult = {
  token: string;
  user: User;
};

export type RegisterInput = {
  fullName: string;
  phoneNumber: string;
  password: string;
  acceptedTerms: true;
};

export type LoginInput = {
  phoneNumber: string;
  password: string;
};
