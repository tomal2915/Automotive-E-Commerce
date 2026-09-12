import { useQuery } from "@tanstack/react-query";
import { fetchBrands } from "./brandApi";

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
    staleTime: 5 * 60 * 1000,
  });
};
