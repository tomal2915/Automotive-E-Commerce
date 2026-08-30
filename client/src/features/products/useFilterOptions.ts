import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

interface FilterOptions {
  years: number[];
  makes: string[];
  models: string[];
  categories: string[];
}

interface FilterQuery {
  year?: number;
  make?: string;
  model?: string;
}

export const useFilterOptions = (query: FilterQuery) => {
  return useQuery({
    queryKey: ["filter-options", query],
    queryFn: async () => {
      const res = await api.get<FilterOptions>("/products/filters/options", {
        params: query,
      });
      return res.data;
    },
  });
};