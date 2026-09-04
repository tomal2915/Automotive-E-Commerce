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
import { verifyRole } from "../middlewares/verifyRole.js";

const router = express.Router();

// Logged-in user routes
router.post("/checkout", verifyAccessToken, initiateCheckout);
router.get("/my/all", verifyAccessToken, getMyOrders);
router.get("/:transactionId", verifyAccessToken, getOrderByTransactionId);

// Admin-only routes
router.get("/admin/all", verifyAccessToken, verifyRole("admin"), getAllOrders);
router.put(
  "/admin/:id/status",
  verifyAccessToken,
  verifyRole("admin"),
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
  verifyRole("admin"),
  getPendingReturns,
);
router.put(
  "/admin/:id/return-review",
  verifyAccessToken,
  verifyRole("admin"),
  reviewReturnRequest,
);

export default router;
