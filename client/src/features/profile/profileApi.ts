import { api } from "../../lib/api";
import type { AuthUser } from "../auth/authApi";

export interface UserProfile extends AuthUser {
  phone: string;
  address: { street: string; city: string; postcode: string };
  avatar: string;
}

export const fetchProfile = async (): Promise<UserProfile> => {
  const res = await api.get("/users/profile");
  return res.data.user;
};

interface UpdateProfileInput {
  name: string;
  phone: string;
  street: string;
  city: string;
  postcode: string;
  avatar?: File;
}

export const updateProfileRequest = async (data: UpdateProfileInput): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("phone", data.phone);
  formData.append("street", data.street);
  formData.append("city", data.city);
  formData.append("postcode", data.postcode);
  if (data.avatar) formData.append("avatar", data.avatar);

  const res = await api.put("/users/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.user;
};

export const changePasswordRequest = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const res = await api.put("/users/change-password", data);
  return res.data;
};