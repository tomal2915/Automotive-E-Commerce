import { api } from "../../lib/api";
import type { ProductFilters, ProductsResponse } from "./productTypes";

export const fetchProducts = async (
  filters: ProductFilters,
): Promise<ProductsResponse> => {
  const res = await api.get("/products", { params: filters });
  return res.data;
};