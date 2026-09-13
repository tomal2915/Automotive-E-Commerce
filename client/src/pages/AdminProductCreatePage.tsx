import { Container, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import ProductForm, {
  type ProductFormValues,
} from "../features/products/ProductForm";
import { createProductRequest } from "../features/products/productAdminApi";
import PageTransition from "../components/PageTransition";

export default function AdminProductCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const mutation = useMutation({
    mutationFn: (payload: {
      values: ProductFormValues;
      mediaRefs: string[];
      specifications: Record<string, string>;
    }) =>
      createProductRequest({
        ...payload.values,
        yearRangeStart: payload.values.yearRangeStart
          ? Number(payload.values.yearRangeStart)
          : undefined,
        yearRangeEnd: payload.values.yearRangeEnd
          ? Number(payload.values.yearRangeEnd)
          : undefined,
        price: Number(payload.values.price),
        stock: Number(payload.values.stock),
        mediaRefs: payload.mediaRefs,
        specifications: payload.specifications,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      enqueueSnackbar("Product created successfully", { variant: "success" });
      navigate("/admin/products");
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to create product",
        { variant: "error" },
      ),
  });

  return (
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Add New Product
        </Typography>
        <ProductForm
          onSubmit={(values, mediaRefs, specifications) =>
            mutation.mutate({ values, mediaRefs, specifications })
          }
          onCancel={() => navigate("/admin/products")}
          isSubmitting={mutation.isPending}
          errorMessage={(mutation.error as any)?.response?.data?.message}
          submitLabel="Create Product"
        />
      </Container>
    </PageTransition>
  );
}
