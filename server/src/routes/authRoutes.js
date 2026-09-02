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

const router = express.Router();

// Temporary test route to confirm the middleware works
router.get("/me", verifyAccessToken, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get('/me', verifyAccessToken, getCurrentUser);
export default router;