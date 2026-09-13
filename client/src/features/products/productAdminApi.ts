import { api } from "../../lib/api";
import type { Product, ProductsResponse } from "./productTypes";

interface ProductFormInput {
  title: string;
  description: string;
  sku: string;
  category: string;
  brand?: string;
  make?: string;
  model?: string;
  yearRangeStart?: number;
  yearRangeEnd?: number;
  price: number;
  stock: number;
  mediaRefs: string[]; // Media _ids chosen via MediaPicker
  specifications: Record<string, string>;
}

export const createProductRequest = async (
  data: ProductFormInput,
): Promise<Product> => {
  const res = await api.post("/products", data);
  return res.data.product;
};

export const updateProductRequest = async (
  id: string,
  data: ProductFormInput,
): Promise<Product> => {
  const res = await api.put(`/products/${id}`, data);
  return res.data.product;
};

export const fetchAdminProducts = async (params: {
  page?: number;
  limit?: number;
}): Promise<ProductsResponse> => {
  const res = await api.get("/products", { params });
  return res.data;
};

export const deleteProductRequest = async (id: string) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};
