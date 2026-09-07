import { api } from "../../lib/api";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
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
  image?: File;
}): Promise<Category> => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("hasVehicleAttributes", String(data.hasVehicleAttributes));
  if (data.parentCategory)
    formData.append("parentCategory", data.parentCategory);
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

export const updateCategoryRequest = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    hasVehicleAttributes?: boolean;
    parentCategory?: string;
    image?: File;
  },
): Promise<Category> => {
  const formData = new FormData();
  if (data.name !== undefined) formData.append("name", data.name);
  if (data.description !== undefined)
    formData.append("description", data.description);
  if (data.hasVehicleAttributes !== undefined)
    formData.append("hasVehicleAttributes", String(data.hasVehicleAttributes));
  if (data.parentCategory !== undefined)
    formData.append("parentCategory", data.parentCategory);
  if (data.image) formData.append("image", data.image);

  const res = await api.put(`/categories/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.category;
};
