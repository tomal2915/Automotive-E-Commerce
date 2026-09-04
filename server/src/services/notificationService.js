import Notification from "../models/Notification.js";

// Central place to create a notification — never throws, since a failed
// notification should never break the order/return flow that triggered it
// (same non-blocking principle as email sending in Step 22)
export const createNotification = async ({ userId, type, title, message, link = null }) => {
  try {
    await Notification.create({ user: userId, type, title, message, link });
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
};