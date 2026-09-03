import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { stripHtml } from "../utils/sanitize.js";

// Recalculates and saves a product's averageRating + reviewCount
// from its current set of reviews. Called after any review write.
const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const { averageRating = 0, reviewCount = 0 } = stats[0] || {};

  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(averageRating * 10) / 10, // round to 1 decimal
    reviewCount,
  });
};

// @route GET /api/v1/reviews/product/:productId
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/reviews/product/:productId
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      rating,
      comment,
    });

    await recalculateProductRating(productId);

    const populated = await review.populate("user", "name avatar");
    res.status(201).json({ review: populated });
  } catch (error) {
    // Duplicate key error means this user already reviewed this product
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "You have already reviewed this product" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route PUT /api/v1/reviews/:reviewId
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only the review's author can edit it
    if (review.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only edit your own review" });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();

    await recalculateProductRating(review.product);

    const populated = await review.populate("user", "name avatar");
    res.json({ review: populated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route DELETE /api/v1/reviews/:reviewId
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Author can delete their own review; admins can moderate/delete any review
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    const productId = review.product;
    await review.deleteOne();
    await recalculateProductRating(productId);

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const review = await Review.create({
  product: productId,
  user: req.user.id,
  rating,
  comment: stripHtml(comment),
});
