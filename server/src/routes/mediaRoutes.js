import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import {
  uploadMedia,
  getMediaLibrary,
  updateMedia,
  deleteMedia,
  moveMedia,
} from "../controllers/mediaController.js";
import {
  getFolders,
  getFolderBreadcrumb,
  createFolder,
  renameFolder,
  deleteFolder,
} from "../controllers/mediaFolderController.js";
import { getFolderPath } from "../utils/getFolderPath.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { requirePermission } from "../middlewares/requirePermission.js"; // built in Step 56

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req) => {
    // req.body.folderId must be sent as a plain form field BEFORE the
    // "files" field in the FormData — multer parses fields in stream
    // order, so if folderId comes after files it won't be populated yet
    const folderPath = await getFolderPath(req.body?.folderId);
    return {
      folder: folderPath
        ? `shop/media-library/${folderPath}`
        : "shop/media-library",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    };
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.use(verifyAccessToken);

router.get("/folders", requirePermission("media:watch"), getFolders);
router.get(
  "/folders/:id/breadcrumb",
  requirePermission("media:watch"),
  getFolderBreadcrumb,
);
router.post("/folders", requirePermission("mediaFolder:create"), createFolder);
router.put(
  "/folders/:id",
  requirePermission("mediaFolder:update"),
  renameFolder,
);
router.delete(
  "/folders/:id",
  requirePermission("mediaFolder:delete"),
  deleteFolder,
);

router.get("/", requirePermission("media:read"), getMediaLibrary);
router.post(
  "/upload",
  requirePermission("media:upload"),
  upload.array("files", 10),
  uploadMedia,
);
router.put("/:id", requirePermission("media:write"), updateMedia);
router.put("/:id/move", requirePermission("media:write"), moveMedia);
router.delete("/:id", requirePermission("media:delete"), deleteMedia);

export default router;
