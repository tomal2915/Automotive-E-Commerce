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
import { verifyRole } from "../middlewares/verifyRole.js";

const router = express.Router();

// Any logged-in user can validate a coupon at checkout
router.post("/validate", verifyAccessToken, validateCoupon);

// Admin only
router.post("/", verifyAccessToken, verifyRole("admin"), createCoupon);
router.get("/", verifyAccessToken, verifyRole("admin"), getAllCoupons);
router.put(
  "/:id/toggle",
  verifyAccessToken,
  verifyRole("admin"),
  toggleCouponStatus,
);
router.put("/:id", verifyAccessToken, verifyRole("admin"), updateCoupon);
router.delete("/:id", verifyAccessToken, verifyRole("admin"), deleteCoupon);

export default router;
