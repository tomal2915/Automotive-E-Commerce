import { api } from "../../lib/api";
import type { LoginFormData, RegisterFormData } from "./authSchemas";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export const registerRequest = async (data: RegisterFormData) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const loginRequest = async (data: LoginFormData): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", data);
  return res.data;
};