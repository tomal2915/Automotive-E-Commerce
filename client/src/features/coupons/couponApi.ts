import { api } from "../../lib/api";

export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  expiresAt: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
}

export const fetchCoupons = async (): Promise<Coupon[]> => {
  const res = await api.get("/coupons");
  return res.data.coupons;
};

export const createCouponRequest = async (data: Partial<Coupon>): Promise<Coupon> => {
  const res = await api.post("/coupons", data);
  return res.data.coupon;
};

export const toggleCouponRequest = async (id: string): Promise<Coupon> => {
  const res = await api.put(`/coupons/${id}/toggle`);
  return res.data.coupon;
};

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  finalAmount: number;
  coupon: { code: string; discountType: string; discountValue: number };
}

export const validateCouponRequest = async (
  code: string,
  orderAmount: number,
): Promise<CouponValidationResult> => {
  const res = await api.post("/coupons/validate", { code, orderAmount });
  return res.data;
};