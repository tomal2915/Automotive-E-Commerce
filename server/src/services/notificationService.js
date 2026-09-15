import Notification from "../models/Notification.js";
import { emitToUser } from "../config/socket.js";
import { logger } from "../config/logger.js";

// Central place to actually create a notification in the DB — called by
// the notification queue's worker process, never directly from a request
// handler. Controllers should enqueue via notificationQueue.add() instead
// (see orderController.js) so a slow DB write or socket emit never blocks
// the API response.
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  link = null,
}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
    });

    // Push it live to the user if they're currently connected — the
    // frontend no longer needs to wait for its next poll to see this
    emitToUser(userId.toString(), "notification:new", notification);
  } catch (error) {
    logger.error({ error: error.message }, "Failed to create notification");
    throw error; // let the queue's retry mechanism handle transient failures
  }
};
