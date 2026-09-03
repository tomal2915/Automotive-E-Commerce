import express from "express";
import {
  setupTwoFactor,
  verifyAndEnableTwoFactor,
  disableTwoFactor,
  verifyTwoFactorLogin,
} from "../controllers/twoFactorController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { twoFactorLimiter } from "../middlewares/rateLimiters.js";

const router = express.Router();

// This one is intentionally public — it's called mid-login, before the
// user has a real access token (only the short-lived twoFactorToken)
router.post("/login-verify", twoFactorLimiter, verifyTwoFactorLogin);

// These require a logged-in user with a normal session — managing your
// own 2FA settings requires you to already be authenticated
router.post("/setup", verifyAccessToken, setupTwoFactor);
router.post("/verify-setup", verifyAccessToken, verifyAndEnableTwoFactor);
router.post("/disable", verifyAccessToken, disableTwoFactor);

export default router;
