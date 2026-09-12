import { api } from "../../lib/api";

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description: string;
  status: "active" | "inactive";
  logo?: { _id: string; url: string; thumbnailUrl: string } | null;
}

export const fetchBrands = async (): Promise<Brand[]> => {
  const res = await api.get("/brands", { params: { limit: 100 } });
  return res.data.brands;
};

export interface BrandInput {
  name: string;
  description: string;
  status: "active" | "inactive";
  logo?: string; // Media ObjectId
}

export const createBrandRequest = async (data: BrandInput): Promise<Brand> => {
  const res = await api.post("/brands", data);
  return res.data.brand;
};

export const updateBrandRequest = async (
  id: string,
  data: Partial<BrandInput>,
): Promise<Brand> => {
  const res = await api.put(`/brands/${id}`, data);
  return res.data.brand;
};

export const deleteBrandRequest = async (id: string) => {
  const res = await api.delete(`/brands/${id}`);
  return res.data;
};
