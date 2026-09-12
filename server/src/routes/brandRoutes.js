import express from "express";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = express.Router();

/**
 * @swagger
 * /brands:
 *   get:
 *     summary: List all brands
 *     tags: [Brands]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive] }
 *     responses:
 *       200:
 *         description: List of brands
 *   post:
 *     summary: Create a brand (requires brand:create permission)
 *     tags: [Brands]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [active, inactive] }
 *     responses:
 *       201: { description: Brand created }
 *       403: { description: Missing permission }
 *       409: { description: Duplicate brand name }
 */
router.get("/", getBrands);
router.post(
  "/",
  verifyAccessToken,
  requirePermission("brand:create"),
  createBrand,
);

router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("brand:update"),
  updateBrand,
);
router.delete(
  "/:id",
  verifyAccessToken,
  requirePermission("brand:delete"),
  deleteBrand,
);

export default router;
