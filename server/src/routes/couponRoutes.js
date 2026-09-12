import express from "express";
import {
  createCoupon,
  getAllCoupons,
  toggleCouponStatus,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = express.Router();

// Any logged-in user can validate a coupon at checkout
router.post("/validate", verifyAccessToken, validateCoupon);

// Admin only
router.post("/", verifyAccessToken, requirePermission("product:create"), createCoupon);
router.get("/", verifyAccessToken, requirePermission("product:create"), getAllCoupons);
router.put(
  "/:id/toggle",
  verifyAccessToken,
  requirePermission("product:create"),
  toggleCouponStatus,
);
router.put("/:id", verifyAccessToken, requirePermission("product:create"), updateCoupon);
router.delete("/:id", verifyAccessToken, requirePermission("product:create"), deleteCoupon);

export default router;
