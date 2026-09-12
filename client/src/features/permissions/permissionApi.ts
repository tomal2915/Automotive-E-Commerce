import { api } from "../../lib/api";

export interface Permission {
  _id: string;
  name: string;
  module: string;
  action: string;
  description: string;
}

export const fetchPermissions = async (): Promise<{
  grouped: Record<string, Permission[]>;
  flat: Permission[];
}> => {
  const res = await api.get("/permissions");
  return res.data;
};

export const createPermissionGroupRequest = async (data: {
  module: string;
  actions: string[];
  customActions: string[];
  description?: string;
}) => {
  const res = await api.post("/permissions/group", data);
  return res.data.permissions;
};

export const deletePermissionRequest = async (id: string) => {
  const res = await api.delete(`/permissions/${id}`);
  return res.data;
};
