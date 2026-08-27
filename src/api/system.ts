import axios from "axios";
import { SIGNUP_URL, SIGNIN_URL, SIGNOUT_URL } from "../constants/apiUrl";
import { clearAuth, getToken } from "../lib/authStorage";
import type { ApiErrorBody } from "../types/form";
import type {
  SignUpBody,
  SignInBody,
  SignUpResponse,
  SignOutResponse,
  SignInResponse,
} from "../types/system";

const AUTH_FREE_URLS: string[] = [SIGNUP_URL, SIGNIN_URL];

axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = token;
  return config;
});

axios.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const isAuthRequest =
      typeof url === "string" && AUTH_FREE_URLS.includes(url);
    if ((status === 401 || status === 403) && !isAuthRequest) {
      clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

const FALLBACK_ERROR_MESSAGE = "發生錯誤，請稍後再試";

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message || FALLBACK_ERROR_MESSAGE;
  }
  return FALLBACK_ERROR_MESSAGE;
}

export async function signUp(body: SignUpBody): Promise<SignUpResponse> {
  const { data } = await axios.post<SignUpResponse>(SIGNUP_URL, body);
  return data;
}

export async function signIn(body: SignInBody): Promise<SignInResponse> {
  const { data } = await axios.post<SignInResponse>(SIGNIN_URL, body);
  return data;
}

export async function signOut(): Promise<SignOutResponse> {
  const { data } = await axios.post<SignOutResponse>(SIGNOUT_URL);
  return data;
}
