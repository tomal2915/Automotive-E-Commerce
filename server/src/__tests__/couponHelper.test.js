import { validateAndCalculateDiscount } from "../utils/couponHelper.js";

const baseCoupon = {
  isActive: true,
  expiresAt: new Date(Date.now() + 86400000), // expires tomorrow
  usageLimit: null,
  usedCount: 0,
  minOrderAmount: 0,
  maxDiscountAmount: null,
};

describe("validateAndCalculateDiscount", () => {
  it("calculates a percentage discount correctly", () => {
    const coupon = {
      ...baseCoupon,
      discountType: "percentage",
      discountValue: 10,
    };
    const discount = validateAndCalculateDiscount(coupon, 100);
    expect(discount).toBe(10);
  });

  it("calculates a fixed discount correctly", () => {
    const coupon = { ...baseCoupon, discountType: "fixed", discountValue: 15 };
    const discount = validateAndCalculateDiscount(coupon, 100);
    expect(discount).toBe(15);
  });

  it("caps a percentage discount at maxDiscountAmount", () => {
    const coupon = {
      ...baseCoupon,
      discountType: "percentage",
      discountValue: 50,
      maxDiscountAmount: 20,
    };
    const discount = validateAndCalculateDiscount(coupon, 1000); // 50% of 1000 = 500, way over the cap
    expect(discount).toBe(20);
  });

  it("never lets the discount exceed the order amount itself", () => {
    const coupon = { ...baseCoupon, discountType: "fixed", discountValue: 500 };
    const discount = validateAndCalculateDiscount(coupon, 50);
    expect(discount).toBe(50); // not 500 — can't discount more than the order costs
  });

  it("throws when the coupon has expired", () => {
    const coupon = {
      ...baseCoupon,
      discountType: "fixed",
      discountValue: 10,
      expiresAt: new Date(Date.now() - 86400000),
    };
    expect(() => validateAndCalculateDiscount(coupon, 100)).toThrow("expired");
  });

  it("throws when the order amount is below minOrderAmount", () => {
    const coupon = {
      ...baseCoupon,
      discountType: "fixed",
      discountValue: 10,
      minOrderAmount: 200,
    };
    expect(() => validateAndCalculateDiscount(coupon, 100)).toThrow(
      "Minimum order amount",
    );
  });

  it("throws when the coupon has reached its usage limit", () => {
    const coupon = {
      ...baseCoupon,
      discountType: "fixed",
      discountValue: 10,
      usageLimit: 5,
      usedCount: 5,
    };
    expect(() => validateAndCalculateDiscount(coupon, 100)).toThrow(
      "usage limit",
    );
  });
});
