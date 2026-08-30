import { useState } from "react";
import { Container, Grid, Typography, Pagination, Box, Alert } from "@mui/material";
import { useProducts } from "../features/products/useProducts";
import ProductCard from "../features/products/ProductCard";
import ProductCardSkeleton from "../features/products/ProductCardSkeleton";

export default function ProductListPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useProducts({ page, limit: 12 });

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" mb={3}>
        Auto Parts Catalog
      </Typography>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load products. Please try again.
        </Alert>
      )}

      <Grid container spacing={2}>
        {isLoading
          ? // Show 12 skeleton cards while loading, matching the page size
            Array.from({ length: 12 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <ProductCardSkeleton />
              </Grid>
            ))
          : data?.products.map((product) => (
              <Grid key={product._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <ProductCard product={product} />
              </Grid>
            ))}
      </Grid>

      {data && data.pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={data.pagination.totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}