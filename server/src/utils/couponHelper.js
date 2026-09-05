// Validates a coupon against an order amount and returns the calculated
// discount, or throws a descriptive error if the coupon can't be applied.
export const validateAndCalculateDiscount = (coupon, orderAmount) => {
  if (!coupon.isActive) {
    throw new Error("This coupon is no longer active");
  }

  if (coupon.expiresAt < new Date()) {
    throw new Error("This coupon has expired");
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("This coupon has reached its usage limit");
  }

  if (orderAmount < coupon.minOrderAmount) {
    throw new Error(
      `Minimum order amount of $${coupon.minOrderAmount} required for this coupon`,
    );
  }

  let discount =
    coupon.discountType === "percentage"
      ? (orderAmount * coupon.discountValue) / 100
      : coupon.discountValue;

  if (
    coupon.maxDiscountAmount !== null &&
    discount > coupon.maxDiscountAmount
  ) {
    discount = coupon.maxDiscountAmount;
  }

  // Discount can never exceed the order total itself
  discount = Math.min(discount, orderAmount);

  return Math.round(discount * 100) / 100; // round to 2 decimal places
};
