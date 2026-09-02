import { useQuery } from "@tanstack/react-query";
import { fetchRelatedProducts } from "./productApi";

export const useRelatedProducts = (productId: string) => {
  return useQuery({
    queryKey: ["related-products", productId],
    queryFn: () => fetchRelatedProducts(productId),
    enabled: !!productId,
  });
};