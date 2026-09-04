import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "order_placed",
        "order_shipped",
        "order_delivered",
        "order_cancelled",
        "return_approved",
        "return_rejected",
        "general",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null }, // e.g. "/my-orders" — where clicking it takes the user
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

// Speeds up the most common query: "this user's unread notifications, newest first"
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
