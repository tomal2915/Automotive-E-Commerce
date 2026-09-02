import { api } from "../../lib/api";
import type { LoginFormData, RegisterFormData } from "./authSchemas";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export const registerRequest = async (data: RegisterFormData) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const loginRequest = async (
  data: LoginFormData,
): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const forgotPasswordRequest = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPasswordRequest = async (
  token: string,
  newPassword: string,
) => {
  const res = await api.post(`/auth/reset-password/${token}`, { newPassword });
  return res.data;
};
