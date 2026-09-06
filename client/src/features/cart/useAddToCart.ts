import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { addToCartRequest } from "./cartApi";
import type { Cart } from "./cartTypes";
import type { Product } from "../products/productTypes";

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { product: Product; quantity?: number }) =>
      addToCartRequest({
        productId: input.product._id,
        quantity: input.quantity ?? 1,
      }),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<Cart>(["cart"]);

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

      return { previousCart };
    },

    onSuccess: (_data, input) => {
      enqueueSnackbar(`${input.product.title} added to cart`, {
        variant: "success",
      });
    },

    onError: (_err, _input, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      enqueueSnackbar("Couldn't add to cart. Please try again.", {
        variant: "error",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
