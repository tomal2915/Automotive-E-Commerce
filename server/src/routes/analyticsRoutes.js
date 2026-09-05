import express from "express";
import {
  getSummary,
  getRevenueTrend,
  getTopProducts,
  getOrderStatusBreakdown,
  getLowStockProducts,
} from "../controllers/analyticsController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const router = express.Router();

router.use(verifyAccessToken, verifyRole("admin"));

router.get("/summary", getSummary);
router.get("/revenue-trend", getRevenueTrend);
router.get("/top-products", getTopProducts);
router.get("/order-status-breakdown", getOrderStatusBreakdown);
router.get("/low-stock", getLowStockProducts);

export default router;
