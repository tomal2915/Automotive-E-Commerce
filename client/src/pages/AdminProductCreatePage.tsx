import { Container, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ProductForm, {
  type ProductFormValues,
} from "../features/products/ProductForm";
import { createProductRequest } from "../features/products/productAdminApi";

export default function AdminProductCreatePage() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (payload: { values: ProductFormValues; images: File[] }) =>
      createProductRequest({
        ...payload.values,
        yearRangeStart: Number(payload.values.yearRangeStart),
        yearRangeEnd: Number(payload.values.yearRangeEnd),
        price: Number(payload.values.price),
        stock: Number(payload.values.stock),
        images: payload.images,
      }),
    onSuccess: () => navigate("/admin/products"),
  });

  return (
    <Container sx={{ py: 4 }}>
      <Typography sx={{ variant: "h4", mb: 3 }}>Add New Product</Typography>
      <ProductForm
        onSubmit={(values, images) => mutation.mutate({ values, images })}
        isSubmitting={mutation.isPending}
        errorMessage={(mutation.error as any)?.response?.data?.message}
        submitLabel="Create Product"
      />
    </Container>
  );
}
