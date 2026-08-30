import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "./productApi";
import type { ProductFilters } from "./productTypes";

export const useProducts = (filters: ProductFilters) => {
  return useQuery({
    // Filters are part of the query key so changing them re-fetches
    // and caches each filter combination separately
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    placeholderData: (previousData) => previousData, // avoids flicker when paging
  });
};