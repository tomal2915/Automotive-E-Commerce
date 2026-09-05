import Coupon from "../models/Coupon.js";
import { validateAndCalculateDiscount } from "../utils/couponHelper.js";

// @route POST /api/v1/coupons (admin only)
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A coupon with this code already exists" });
    }
    res
      .status(400)
      .json({ message: "Invalid coupon data", error: error.message });
  }
};

// @route GET /api/v1/coupons (admin only)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route PUT /api/v1/coupons/:id/toggle (admin only)
// Simple activate/deactivate — no full edit form needed for a discount code
export const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({ coupon });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/coupons/validate
// Called from the cart page when the user clicks "Apply" — checks the
// coupon and returns the calculated discount WITHOUT consuming a usage slot
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || orderAmount === undefined) {
      return res
        .status(400)
        .json({ message: "Coupon code and order amount are required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    const discount = validateAndCalculateDiscount(coupon, orderAmount);

    res.json({
      valid: true,
      discount,
      finalAmount: Math.round((orderAmount - discount) * 100) / 100,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    // validateAndCalculateDiscount throws plain Errors with user-friendly messages
    res.status(400).json({ valid: false, message: error.message });
  }
};
