import type { Product } from "../products/productTypes";

export interface CartItem {
  product: Product;
  quantity: number;
  priceAtAdd: number;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
}