export type SignUpBody = {
  email: string;
  password: string;
  nickname: string;
};

export type SignUpResponse = {
  status: boolean;
  uid: string;
};

export type SignInBody = {
  email: string;
  password: string;
};

export type SignInResponse = {
  status: boolean;
  exp: number;
  token: string;
  nickname: string;
  email: string;
};

export type SignOutResponse = {
  status: boolean;
  message: string;
};
