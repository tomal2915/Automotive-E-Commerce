import express from "express";
import {
  registerUser,
  loginUser,
  refreshTokenHandler,
  logoutUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getSession, // ADD THIS
} from "../controllers/authController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import {
  authLimiter,
  emailActionLimiter,
} from "../middlewares/rateLimiters.js";

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/refresh-token", refreshTokenHandler);
router.post("/logout", logoutUser);
router.post("/forgot-password", emailActionLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);
router.post("/verify-email/:token", verifyEmail);
router.post(
  "/resend-verification",
  emailActionLimiter,
  resendVerificationEmail,
);

router.get("/session", verifyAccessToken, getSession);

export default router;
