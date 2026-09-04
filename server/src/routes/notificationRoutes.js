import express from "express";
import { getMyNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();

router.use(verifyAccessToken);

router.get("/", getMyNotifications);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);

export default router;