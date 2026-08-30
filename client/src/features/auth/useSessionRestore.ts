import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { setAccessToken } from "../../lib/tokenStore";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../lib/api";
import type { AuthUser } from "./authApi";

export const useSessionRestore = () => {
  const [isRestoring, setIsRestoring] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  // Guards against React StrictMode's intentional double-invoke of effects
  // in development, which would otherwise fire this restore call twice.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const restoreSession = async () => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = res.data;
        setAccessToken(accessToken);

        const meRes = await api.get<{ user: AuthUser }>("/auth/me");
        setUser(meRes.data.user);
      } catch {
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
