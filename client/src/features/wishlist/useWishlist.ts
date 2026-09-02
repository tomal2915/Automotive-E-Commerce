import { useQuery } from "@tanstack/react-query";
import { fetchWishlist } from "./wishlistApi";
import { useAuthStore } from "../../store/authStore";

export const useWishlist = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    enabled: isAuthenticated,
  });
};