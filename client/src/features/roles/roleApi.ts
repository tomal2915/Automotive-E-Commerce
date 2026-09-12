import { api } from "../../lib/api";
import type { Permission } from "../permissions/permissionApi";

export interface Role {
  _id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  permissions: Permission[];
  userCount: number;
}

export const fetchRoles = async (): Promise<Role[]> => {
  const res = await api.get("/roles", { params: { limit: 100 } });
  return res.data.roles;
};

export const createRoleRequest = async (data: {
  name: string;
  description: string;
  permissions: string[];
}): Promise<Role> => {
  const res = await api.post("/roles", data);
  return res.data.role;
};

export const updateRoleRequest = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    permissions?: string[];
    status?: string;
  },
): Promise<Role> => {
  const res = await api.put(`/roles/${id}`, data);
  return res.data.role;
};

export const deleteRoleRequest = async (id: string) => {
  const res = await api.delete(`/roles/${id}`);
  return res.data;
};
