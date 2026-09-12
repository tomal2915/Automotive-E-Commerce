import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { getAccessToken, setAccessToken } from "./tokenStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Shared across all concurrent 401s — only one refresh call goes out at a time.
// While it's in flight, every other 401'd request awaits the SAME promise
// instead of firing its own refresh-token call.
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
        {},
        { withCredentials: true },
      )
      .then((res) => {
        const { accessToken } = res.data;
        setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null; // reset so the NEXT expiry can trigger a fresh call
      });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403) {
      enqueueSnackbar(
        error.response.data?.message || "You don't have permission to do that.",
        { variant: "error" },
      );
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const accessToken = await refreshAccessToken(); // shared promise
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
