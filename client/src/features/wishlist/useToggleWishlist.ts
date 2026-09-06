import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { addToWishlistRequest, removeFromWishlistRequest } from "./wishlistApi";
import type { Wishlist } from "./wishlistApi";
import type { Product } from "../products/productTypes";

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      product,
      isInWishlist,
    }: {
      product: Product;
      isInWishlist: boolean;
    }) => {
      return isInWishlist
        ? removeFromWishlistRequest(product._id)
        : addToWishlistRequest(product._id);
    },

    onMutate: async ({ product, isInWishlist }) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previous = queryClient.getQueryData<Wishlist>(["wishlist"]);

      queryClient.setQueryData<Wishlist>(["wishlist"], (old) => {
        const products = old?.products ?? [];
        return isInWishlist
          ? { products: products.filter((p) => p._id !== product._id) }
          : { products: [...products, product] };
      });

      return { previous };
    },

    onSuccess: (_data, { product, isInWishlist }) => {
      enqueueSnackbar(
        `${product.title} ${isInWishlist ? "removed from" : "added to"} wishlist`,
        {
          variant: "success",
        },
      );
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["wishlist"], context.previous);
      }
      enqueueSnackbar("Couldn't update wishlist. Please try again.", {
        variant: "error",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};
