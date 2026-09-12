import { api } from "../../lib/api";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: { _id: string; name: string };
  isEmailVerified: boolean;
  createdAt: string;
}

export interface RoleOption {
  _id: string;
  name: string;
}

export const fetchAllUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ users: AdminUser[]; pagination: any }> => {
  const res = await api.get("/users/admin/all", { params });
  return res.data;
};

export const fetchRoleOptions = async (): Promise<{ roles: RoleOption[] }> => {
  const res = await api.get("/role/options");
  return res.data;
};

export const deleteUserRequest = async (id: string) => {
  const res = await api.delete(`/users/admin/${id}`);
  return res.data;
};

export const updateUserRoleRequest = async (id: string, roleId: string) => {
  const res = await api.put(`/users/admin/${id}/role`, { roleId });
  return res.data;
};
