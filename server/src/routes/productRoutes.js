import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFilterOptions,
} from "../controllers/productController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const router = express.Router();

// Public routes — anyone can browse the catalog
router.get("/", getProducts);
router.get("/filters/options", getFilterOptions);
router.get("/:id", getProductById);

// Admin-only routes — require a valid access token AND the admin role
router.post("/", verifyAccessToken, verifyRole("admin"), createProduct);
router.put("/:id", verifyAccessToken, verifyRole("admin"), updateProduct);
router.delete("/:id", verifyAccessToken, verifyRole("admin"), deleteProduct);

export default router;