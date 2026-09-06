import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const categoryImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "shop/categories",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});
const uploadCategoryImage = multer({ storage: categoryImageStorage }).single(
  "image",
);

const router = express.Router();

router.get("/", getCategories);
router.post(
  "/",
  verifyAccessToken,
  verifyRole("admin"),
  uploadCategoryImage,
  createCategory,
);
router.put(
  "/:id",
  verifyAccessToken,
  verifyRole("admin"),
  uploadCategoryImage,
  updateCategory,
);
router.delete("/:id", verifyAccessToken, verifyRole("admin"), deleteCategory);

export default router;
