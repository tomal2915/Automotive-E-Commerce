import { api } from "../../lib/api";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  hasVehicleAttributes: boolean;
  isActive: boolean;
}

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await api.get("/categories");
  return res.data.categories;
};

export const createCategoryRequest = async (data: {
  name: string;
  description: string;
  hasVehicleAttributes: boolean;
  image?: File;
}): Promise<Category> => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("hasVehicleAttributes", String(data.hasVehicleAttributes));
  if (data.image) formData.append("image", data.image);

  const res = await api.post("/categories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.category;
};

export const deleteCategoryRequest = async (id: string) => {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
};
