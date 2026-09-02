import { api } from "../../lib/api";

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
  images: File[];
}

export const createProductRequest = async (data: ProductFormInput) => {
  const formData = new FormData();

  // Every non-file field goes in as a plain string
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

  // Files are appended under the same field name Multer expects ("images")
  data.images.forEach((file) => formData.append("images", file));

  const res = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.product;
};