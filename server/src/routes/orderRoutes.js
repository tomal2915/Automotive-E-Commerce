import express from "express";
import {
  initiateCheckout,
  handleIPN,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  getOrderByTransactionId,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  requestReturn,
  reviewReturnRequest,
  getPendingReturns,
} from "../controllers/orderController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = express.Router();

// Logged-in user routes
router.post("/checkout", verifyAccessToken, initiateCheckout);
router.get("/my/all", verifyAccessToken, getMyOrders);
router.get("/:transactionId", verifyAccessToken, getOrderByTransactionId);

// Admin-only routes
router.get("/admin/all", verifyAccessToken, requirePermission("product:create"), getAllOrders);
router.put(
  "/admin/:id/status",
  verifyAccessToken,
  requirePermission("product:create"),
  updateOrderStatus,
);

// SSLCommerz callbacks — no auth
router.post("/payment/ipn", handleIPN);
router.post("/payment/success", paymentSuccess);
router.post("/payment/fail", paymentFail);
router.post("/payment/cancel", paymentCancel);

router.post("/:id/cancel", verifyAccessToken, cancelOrder);
router.post("/:id/return", verifyAccessToken, requestReturn);

router.get(
  "/admin/returns",
  verifyAccessToken,
  requirePermission("product:create"),
  getPendingReturns,
);
router.put(
  "/admin/:id/return-review",
  verifyAccessToken,
  requirePermission("product:create"),
  reviewReturnRequest,
);

export default router;
