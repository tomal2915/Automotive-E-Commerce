import express from 'express';
import {
  registerUser,
  loginUser,
  refreshTokenHandler,
  logoutUser,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', logoutUser);

export default router;