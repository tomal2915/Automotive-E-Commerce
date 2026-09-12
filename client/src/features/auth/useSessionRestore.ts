import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { setAccessToken } from "../../lib/tokenStore";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../lib/api";

export const useSessionRestore = () => {
  const [isRestoring, setIsRestoring] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  const setPermissions = useAuthStore((state) => state.setPermissions);
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

        const sessionRes = await api.get("/auth/session");
        setUser(sessionRes.data.user);
        setPermissions(sessionRes.data.permissions, sessionRes.data.role.name);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, [setUser, setPermissions]);

  return { isRestoring };
};
