import { api } from "../../lib/api";
import type {
  Product,
  ProductFilters,
  ProductsResponse,
  MediaRef,
} from "./productTypes";

// Backend returns mediaRefs as nested subdocuments:
// { _id, media: { _id, url, thumbnailUrl }, isThumbnail, isGallery, sortOrder }
// The frontend only cares about the flat Media info, so unwrap it here —
// once, at the API boundary — rather than teaching every consumer about
// the nested shape.
interface RawMediaRef {
  media: MediaRef | null;
  isThumbnail?: boolean;
}

const normalizeProduct = (raw: any): Product => ({
  ...raw,
  mediaRefs: (raw.mediaRefs ?? [])
    .filter((ref: RawMediaRef) => ref.media) // drop any dangling/unpopulated refs
    .map((ref: RawMediaRef) => ref.media as MediaRef),
});

export const fetchProducts = async (
  filters: ProductFilters,
): Promise<ProductsResponse> => {
  const res = await api.get("/products", { params: filters });
  return {
    ...res.data,
    products: res.data.products.map(normalizeProduct),
  };
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const res = await api.get(`/products/${id}`);
  return normalizeProduct(res.data.product);
};

export const fetchAdminProducts = async (params: {
  page?: number;
  limit?: number;
}): Promise<ProductsResponse> => {
  const res = await api.get("/products", { params });
  return {
    ...res.data,
    products: res.data.products.map(normalizeProduct),
  };
};

export const deleteProductRequest = async (id: string) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

export const fetchRelatedProducts = async (
  productId: string,
): Promise<Product[]> => {
  const res = await api.get(`/products/${productId}/related`);
  return res.data.related.map(normalizeProduct);
};

export const fetchProductsByIds = async (ids: string[]): Promise<Product[]> => {
  if (ids.length === 0) return [];
  const res = await api.get("/products/batch", {
    params: { ids: ids.join(",") },
  });
  return res.data.products.map(normalizeProduct);
};
