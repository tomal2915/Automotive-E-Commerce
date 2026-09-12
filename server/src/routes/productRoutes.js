import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFilterOptions,
  getSearchSuggestions,
  getRelatedProducts,
  getProductsByIds,
  previewVariantCombinations,
} from "../controllers/productController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import { uploadProductImages } from "../middlewares/uploadImage.js";
import { handleUploadError } from "../middlewares/handleUploadError.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/filters/options", getFilterOptions);
router.get("/search/suggestions", getSearchSuggestions); // must come before /:id
router.get("/batch", getProductsByIds); // must come before /:id
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

router.post(
  "/",
  verifyAccessToken,
  requirePermission("product:create"),
  uploadProductImages,
  handleUploadError,
  createProduct,
);
router.post(
  "/generate-variants",
  verifyAccessToken,
  previewVariantCombinations,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("product:update"),
  uploadProductImages,
  handleUploadError,
  updateProduct,
);

router.delete(
  "/:id",
  verifyAccessToken,
  requirePermission("product:delete"),
  deleteProduct,
);

export default router;
