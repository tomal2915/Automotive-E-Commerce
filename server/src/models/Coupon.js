import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // normalize so "save10" and "SAVE10" are treated the same
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },

    // For percentage discounts, cap the absolute discount so a "50% off"
    // coupon can't blow out on an unexpectedly large order
    maxDiscountAmount: { type: Number, default: null },

    minOrderAmount: { type: Number, default: 0 },

    expiresAt: { type: Date, required: true },

    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// maxDiscountAmount only means something for percentage discounts (it caps
// the absolute payout). On a fixed-amount coupon it's meaningless, so
// silently null it out here rather than trusting every caller (controller,
// admin UI, future API consumers) to remember to omit it.
couponSchema.pre("validate", function () {
  if (this.discountType === "fixed") {
    this.maxDiscountAmount = null;
  }
});

export default mongoose.model("Coupon", couponSchema);
