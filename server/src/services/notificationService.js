import Notification from "../models/Notification.js";
import { emitToUser } from "../config/socket.js";

// Central place to create a notification — never throws, since a failed
// notification should never break the order/return flow that triggered it
// (same non-blocking principle as email sending in Step 22)
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
  }
};
