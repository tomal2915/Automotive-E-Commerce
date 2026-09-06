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
    mutationFn: (payload: { values: ProductFormValues; images: File[] }) =>
      updateProductRequest(id!, {
        ...payload.values,
        yearRangeStart: Number(payload.values.yearRangeStart),
        yearRangeEnd: Number(payload.values.yearRangeEnd),
        price: Number(payload.values.price),
        stock: Number(payload.values.stock),
        images: payload.images,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/admin/products");
    },
  });

  if (isLoading) return <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>Loading...</Container>;
  if (!product) return <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>Product not found</Container>;

  return (
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography sx={{ variant: "h4", mb: 3 }}>Edit Product</Typography>
        <ProductForm
          onSubmit={(values, images, specifications) =>
            mutation.mutate({
              values: {
                ...values,
                yearRangeStart: values.yearRangeStart
                  ? Number(values.yearRangeStart)
                  : undefined,
                yearRangeEnd: values.yearRangeEnd
                  ? Number(values.yearRangeEnd)
                  : undefined,
                price: Number(values.price),
                stock: Number(values.stock),
              },
              images,
              specifications,
            })
          }
          isSubmitting={mutation.isPending}
          errorMessage={(mutation.error as any)?.response?.data?.message}
          submitLabel="Update Product"
        />
      </Container>
    </PageTransition>
  );
}
