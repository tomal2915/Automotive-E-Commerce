import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import {
  uploadMedia,
  getMediaLibrary,
  updateMedia,
  deleteMedia,
} from "../controllers/mediaController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { requirePermission } from "../middlewares/requirePermission.js"; // built in Step 56

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "shop/media-library",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.use(verifyAccessToken);

router.get("/", requirePermission("media:read"), getMediaLibrary);
router.post(
  "/upload",
  requirePermission("media:upload"),
  upload.array("files", 10),
  uploadMedia,
);
router.put("/:id", requirePermission("media:write"), updateMedia);
router.delete("/:id", requirePermission("media:delete"), deleteMedia);

export default router;
