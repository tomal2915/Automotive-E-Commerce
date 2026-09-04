import { api } from "../../lib/api";

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export const fetchNotifications = async (): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> => {
  const res = await api.get("/notifications");
  return res.data;
};

export const markNotificationReadRequest = async (id: string) => {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsReadRequest = async () => {
  const res = await api.put("/notifications/read-all");
  return res.data;
};
