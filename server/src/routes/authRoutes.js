import express from 'express';
import {
  registerUser,
  loginUser,
  refreshTokenHandler,
  logoutUser,
  getCurrentUser,
} from '../controllers/authController.js';
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { forgotPassword, resetPassword } from "../controllers/authController.js";
import { verifyEmail, resendVerificationEmail } from "../controllers/authController.js";
import { authLimiter, emailActionLimiter } from "../middlewares/rateLimiters.js";

const router = express.Router();

// Temporary test route to confirm the middleware works
router.get("/me", verifyAccessToken, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', logoutUser);
router.post("/forgot-password", emailActionLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);
router.post("/verify-email/:token", verifyEmail);
router.post("/resend-verification", emailActionLimiter, resendVerificationEmail);
router.get('/me', verifyAccessToken, getCurrentUser);
export default router;