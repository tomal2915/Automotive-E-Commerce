import { api } from "../../lib/api";
import type { Product, ProductFilters, ProductsResponse } from "./productTypes";

export const fetchProducts = async (
  filters: ProductFilters,
): Promise<ProductsResponse> => {
  const res = await api.get("/products", { params: filters });
  return res.data;
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const res = await api.get(`/products/${id}`);
  return res.data.product;
};