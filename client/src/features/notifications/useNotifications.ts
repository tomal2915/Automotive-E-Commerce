import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "./notificationApi";
import { useAuthStore } from "../../store/authStore";

export const useNotifications = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: isAuthenticated,
    refetchInterval: 2 * 60 * 1000, // fallback safety net — WebSocket handles real-time now, this just re-syncs if a socket event was ever missed (e.g. brief disconnect)
    refetchIntervalInBackground: false, // don't poll when the tab isn't focused — saves resources
  });
};
