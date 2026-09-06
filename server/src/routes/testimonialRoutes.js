import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "shop/testimonials",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});
const uploadAvatar = multer({ storage: avatarStorage }).single("avatar");

const router = express.Router();

router.get("/", getTestimonials);
router.get(
  "/admin/all",
  verifyAccessToken,
  verifyRole("admin"),
  getAllTestimonials,
);
router.post(
  "/",
  verifyAccessToken,
  verifyRole("admin"),
  uploadAvatar,
  createTestimonial,
);
router.put(
  "/:id",
  verifyAccessToken,
  verifyRole("admin"),
  uploadAvatar,
  updateTestimonial,
);
router.delete(
  "/:id",
  verifyAccessToken,
  verifyRole("admin"),
  deleteTestimonial,
);

export default router;
