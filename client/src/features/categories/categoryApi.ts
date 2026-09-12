import { api } from "../../lib/api";

export interface MediaRef {
  _id: string;
  url: string;
  thumbnailUrl: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: MediaRef | null;
  hasVehicleAttributes: boolean;
  isActive: boolean;
  parentCategory: string | null;
  subcategories?: Category[];
}

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await api.get("/categories");
  return res.data.categories;
};

export const createCategoryRequest = async (data: {
  name: string;
  description: string;
  hasVehicleAttributes: boolean;
  parentCategory?: string;
  image?: string | null; // Media _id chosen via MediaPicker
}): Promise<Category> => {
  const res = await api.post("/categories", data);
  return res.data.category;
};

export const updateCategoryRequest = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    hasVehicleAttributes?: boolean;
    parentCategory?: string;
    image?: string | null;
    removeImage?: boolean;
  },
): Promise<Category> => {
  const res = await api.put(`/categories/${id}`, data);
  return res.data.category;
};

export const deleteCategoryRequest = async (id: string) => {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
};
