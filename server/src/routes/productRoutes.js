import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFilterOptions,
  getSearchSuggestions,
} from "../controllers/productController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import { uploadProductImages } from "../middlewares/uploadImage.js";
import { handleUploadError } from "../middlewares/handleUploadError.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/filters/options", getFilterOptions);
router.get("/search/suggestions", getSearchSuggestions); // must come before /:id
router.get("/:id", getProductById);

router.post(
  "/",
  verifyAccessToken,
  verifyRole("admin"),
  uploadProductImages,
  handleUploadError,
  createProduct,
);
router.put(
  "/:id",
  verifyAccessToken,
  verifyRole("admin"),
  uploadProductImages,
  handleUploadError,
  updateProduct,
);
router.delete("/:id", verifyAccessToken, verifyRole("admin"), deleteProduct);

export default router;
