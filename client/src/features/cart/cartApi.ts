import { api } from "../../lib/api";
import type { Cart } from "./cartTypes";

export const fetchCart = async (): Promise<Cart> => {
  const res = await api.get("/cart");
  return res.data.cart;
};

export const addToCartRequest = async (item: {
  productId: string;
  quantity?: number;
}): Promise<Cart> => {
  const res = await api.post("/cart", item);
  return res.data.cart;
};

export const updateCartItemRequest = async (
  productId: string,
  quantity: number,
): Promise<Cart> => {
  const res = await api.put(`/cart/${productId}`, { quantity });
  return res.data.cart;
};

export const removeFromCartRequest = async (productId: string): Promise<Cart> => {
  const res = await api.delete(`/cart/${productId}`);
  return res.data.cart;
};