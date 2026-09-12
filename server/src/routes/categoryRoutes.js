import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { requirePermission } from "../middlewares/requirePermission.js";


const router = express.Router();

router.get("/", getCategories);
router.post(
  "/",
  verifyAccessToken,
  requirePermission("category:create"),
  createCategory,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("category:update"),
  updateCategory,
);
router.delete("/:id", verifyAccessToken, requirePermission("product:create"), deleteCategory);

export default router;
