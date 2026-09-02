import express from "express";
import { getProfile, updateProfile, changePassword } from "../controllers/userController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { uploadAvatar } from "../middlewares/uploadImage.js";
import { handleUploadError } from "../middlewares/handleUploadError.js";

const router = express.Router();

// Every route here requires a logged-in user
router.use(verifyAccessToken);

router.get("/profile", getProfile);
router.put("/profile", uploadAvatar, handleUploadError, updateProfile);
router.put("/change-password", changePassword);

export default router;