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

interface ProductFormInput {
  title: string;
  description: string;
  partNumber: string;
  make: string;
  model: string;
  yearRangeStart: number;
  yearRangeEnd: number;
  category: string;
  price: number;
  stock: number;
  images: File[]; // new images to add/replace, may be empty
}

export const updateProductRequest = async (
  id: string,
  data: ProductFormInput,
): Promise<Product> => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("partNumber", data.partNumber);
  formData.append("make", data.make);
  formData.append("model", data.model);
  formData.append("yearRangeStart", String(data.yearRangeStart));
  formData.append("yearRangeEnd", String(data.yearRangeEnd));
  formData.append("category", data.category);
  formData.append("price", String(data.price));
  formData.append("stock", String(data.stock));
  data.images.forEach((file) => formData.append("images", file));

  const res = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.product;
};
