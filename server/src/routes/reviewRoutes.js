import express from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();

// Public — anyone can read reviews
router.get("/product/:productId", getProductReviews);

// Requires login
router.post("/product/:productId", verifyAccessToken, createReview);
router.put("/:reviewId", verifyAccessToken, updateReview);
router.delete("/:reviewId", verifyAccessToken, deleteReview);

export default router;