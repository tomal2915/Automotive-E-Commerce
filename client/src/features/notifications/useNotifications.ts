import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "./notificationApi";
import { useAuthStore } from "../../store/authStore";

export const useNotifications = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: isAuthenticated,
    refetchInterval: 30_000, // poll every 30 seconds for new notifications
    refetchIntervalInBackground: false, // don't poll when the tab isn't focused — saves resources
  });
};
