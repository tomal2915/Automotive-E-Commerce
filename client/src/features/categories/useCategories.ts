import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "./categoryApi";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // categories change rarely — cache for 5 minutes
  });
};
