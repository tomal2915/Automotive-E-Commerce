import express from "express";
import {
  getSummary,
  getRevenueTrend,
  getTopProducts,
  getOrderStatusBreakdown,
  getLowStockProducts,
  getDashboardBundle,
} from "../controllers/analyticsController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = express.Router();

// FIX: was incorrectly "product:create" — viewing the dashboard should
// only require dashboard:watch, matching the permission model's own naming
router.use(verifyAccessToken, requirePermission("dashboard:watch"));

router.get("/dashboard", getDashboardBundle); // NEW — single combined call for the dashboard page

router.get("/summary", getSummary);
router.get("/revenue-trend", getRevenueTrend);
router.get("/top-products", getTopProducts);
router.get("/order-status-breakdown", getOrderStatusBreakdown);
router.get("/low-stock", getLowStockProducts);

export default router;
