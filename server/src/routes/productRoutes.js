import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  getFilterOptions,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/filters/options", getFilterOptions);
router.get("/:id", getProductById);
router.post("/", createProduct); // will restrict to admin-only in Step 11

export default router;