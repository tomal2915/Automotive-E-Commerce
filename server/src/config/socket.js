import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { logger } from "./logger.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  // Authenticate the socket handshake using the same access token the
  // REST API uses — no separate auth system to maintain
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return next(new Error("Unauthorized"));
      socket.userId = decoded.userId;
      next();
    });
  });

  io.on("connection", (socket) => {
    // Each user joins a private "room" named after their own ID — a
    // notification is emitted only into that room, so users never see
    // each other's events even though they share one socket server
    socket.join(`user:${socket.userId}`);
    logger.debug({ userId: socket.userId }, "Socket connected");

    socket.on("disconnect", () => {
      logger.debug({ userId: socket.userId }, "Socket disconnected");
    });
  });

  return io;
};

// Called from anywhere in the app (e.g. notificationService.js) to push
// a real-time event to a specific user, if they're currently connected
export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};
