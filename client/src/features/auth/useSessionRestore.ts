import { useEffect, useState } from "react";
import axios from "axios";
import { setAccessToken } from "../../lib/tokenStore";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../lib/api";
import type { AuthUser } from "./authApi";

// Runs once on app load. Tries to silently restore a session using the
// HttpOnly refresh cookie, so a page reload doesn't log the user out.
export const useSessionRestore = () => {
  const [isRestoring, setIsRestoring] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Plain axios (not our `api` instance) so a failure here doesn't
        // trigger the response interceptor's own refresh/retry logic.
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = res.data;
        setAccessToken(accessToken);

        // Fetch the current user's profile now that we have a valid token
        const meRes = await api.get<{ user: AuthUser }>("/auth/me");
        setUser(meRes.data.user);
      } catch {
        // No valid refresh cookie (or it's expired) -> user stays logged out
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, [setUser]);

  return { isRestoring };
};
