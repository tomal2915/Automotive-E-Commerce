import { useQuery } from "@tanstack/react-query";
import { fetchCart } from "./cartApi";
import { useAuthStore } from "../../store/authStore";

export const useCart = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
    enabled: isAuthenticated, // don't fetch a cart for logged-out users
  });
};