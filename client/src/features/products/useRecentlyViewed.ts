import { useQuery } from "@tanstack/react-query";
import { fetchProductsByIds } from "./productApi";
import { getRecentlyViewedIds } from "./recentlyViewed";

export const useRecentlyViewed = () => {
  const ids = getRecentlyViewedIds();

  return useQuery({
    queryKey: ["recently-viewed", ids],
    queryFn: () => fetchProductsByIds(ids),
    enabled: ids.length > 0,
  });
};