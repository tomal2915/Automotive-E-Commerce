import express from "express";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { uploadAvatar } from "../middlewares/uploadImage.js";
import { handleUploadError } from "../middlewares/handleUploadError.js";
import {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
  updateUserRole,
} from "../controllers/userController.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = express.Router();

// Every route here requires a logged-in user
router.use(verifyAccessToken);

router.get("/profile", getProfile);
router.put("/profile", uploadAvatar, handleUploadError, updateProfile);
router.put("/change-password", changePassword);

// Admin-only user management
router.get("/admin/all", requirePermission("user:watch"), getAllUsers);
router.delete("/admin/:id", requirePermission("user:delete"), deleteUser);
router.put("/admin/:id/role", requirePermission("user:update"), updateUserRole);

export default router;
