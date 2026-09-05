import { api } from "../../lib/api";
import type { Product } from "../products/productTypes";

export interface Wishlist {
  products: Product[];
}

export const fetchWishlist = async (): Promise<Wishlist> => {
  const res = await api.get("/wishlist");
  return res.data.wishlist;
};

export const addToWishlistRequest = async (
  productId: string,
): Promise<Wishlist> => {
  const res = await api.post(`/wishlist/${productId}`);
  return res.data.wishlist;
};

export const removeFromWishlistRequest = async (
  productId: string,
): Promise<Wishlist> => {
  const res = await api.delete(`/wishlist/${productId}`);
  return res.data.wishlist;
};
