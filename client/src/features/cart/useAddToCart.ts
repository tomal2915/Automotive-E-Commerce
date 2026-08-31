import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCartRequest } from "./cartApi";
import type { Cart } from "./cartTypes";
import type { Product } from "../products/productTypes";

interface AddToCartInput {
  product: Product; // full product needed to render the optimistic item
  quantity?: number;
}

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddToCartInput) =>
      addToCartRequest({ productId: input.product._id, quantity: input.quantity ?? 1 }),

    onMutate: async (input) => {
      // Cancel any in-flight cart refetch so it doesn't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<Cart>(["cart"]);

      // Optimistically update the UI before the server responds
      queryClient.setQueryData<Cart>(["cart"], (old) => {
        const items = old?.items ?? [];
        const existing = items.find((i) => i.product._id === input.product._id);

        if (existing) {
          return {
            ...old,
            items: items.map((i) =>
              i.product._id === input.product._id
                ? { ...i, quantity: i.quantity + (input.quantity ?? 1) }
                : i,
            ),
          } as Cart;
        }

        return {
          items: [
            ...items,
            {
              product: input.product,
              quantity: input.quantity ?? 1,
              priceAtAdd: input.product.price,
            },
          ],
        };
      });

      // Returned here becomes `context` in onError, for rollback
      return { previousCart };
    },

    onError: (_err, _input, context) => {
      // Roll back to the pre-mutation cart if the request failed
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },

    onSettled: () => {
      // Always resync with the server's actual state afterward
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};