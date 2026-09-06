import { Container, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm, {
  type ProductFormValues,
} from "../features/products/ProductForm";
import { fetchProductById } from "../features/products/productApi";
import { updateProductRequest } from "../features/products/productAdminApi";
import PageTransition from "../components/PageTransition";

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (payload: {
      values: ProductFormValues;
      images: File[];
      specifications: Record<string, string>;
    }) =>
      updateProductRequest(id!, {
        ...payload.values,
        yearRangeStart: payload.values.yearRangeStart
          ? Number(payload.values.yearRangeStart)
          : undefined,
        yearRangeEnd: payload.values.yearRangeEnd
          ? Number(payload.values.yearRangeEnd)
          : undefined,
        price: Number(payload.values.price),
        stock: Number(payload.values.stock),
        images: payload.images,
        specifications: payload.specifications,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/admin/products");
    },
  });

  if (isLoading)
    return (
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>Loading...</Container>
    );
  if (!product)
    return (
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        Product not found
      </Container>
    );

  return (
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Edit Product
        </Typography>
        <ProductForm
          key={product._id} // forces a fresh mount once the real product data has loaded, so the form's useState picks up actual values instead of empty initial state
          initialProduct={product} // THIS was missing — without it, the form never knows this is edit mode
          onSubmit={(values, images, specifications) =>
            mutation.mutate({ values, images, specifications })
          }
          isSubmitting={mutation.isPending}
          errorMessage={(mutation.error as any)?.response?.data?.message}
          submitLabel="Update Product"
        />
      </Container>
    </PageTransition>
  );
}
