import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { getAccessToken } from "../lib/tokenStore";

export const useSocket = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = getAccessToken();
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL.replace("/api/v1", ""), {
      auth: { token },
    });
    socketRef.current = socket;

    // A new notification arrived — push it directly into the React
    // Query cache instead of refetching, so it appears instantly
    // without an extra network round trip
    socket.on("notification:new", (notification) => {
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old;
        return {
          notifications: [notification, ...old.notifications].slice(0, 30),
          unreadCount: old.unreadCount + 1,
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, queryClient]);
};
