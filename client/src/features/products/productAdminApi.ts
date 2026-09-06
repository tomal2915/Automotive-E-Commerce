import { api } from "../../lib/api";
import type { Product, ProductsResponse } from "./productTypes";

interface ProductFormInput {
  title: string;
  description: string;
  sku: string;
  category: string;
  make?: string;
  model?: string;
  yearRangeStart?: number;
  yearRangeEnd?: number;
  price: number;
  stock: number;
  images: File[];
  specifications: Record<string, string>;
}

const buildProductFormData = (data: ProductFormInput): FormData => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("sku", data.sku);
  formData.append("category", data.category);
  formData.append("price", String(data.price));
  formData.append("stock", String(data.stock));

  if (data.make) formData.append("make", data.make);
  if (data.model) formData.append("model", data.model);
  if (data.yearRangeStart)
    formData.append("yearRangeStart", String(data.yearRangeStart));
  if (data.yearRangeEnd)
    formData.append("yearRangeEnd", String(data.yearRangeEnd));

  formData.append("specifications", JSON.stringify(data.specifications));

  data.images.forEach((file) => formData.append("images", file));
  return formData;
};

export const createProductRequest = async (
  data: ProductFormInput,
): Promise<Product> => {
  const formData = buildProductFormData(data);
  const res = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.product;
};

export const updateProductRequest = async (
  id: string,
  data: ProductFormInput,
): Promise<Product> => {
  const formData = buildProductFormData(data);
  const res = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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
