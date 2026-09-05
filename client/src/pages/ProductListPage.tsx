import { useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Pagination,
  Box,
  Alert,
} from "@mui/material";
import { useProducts } from "../features/products/useProducts";
import ProductCard from "../features/products/ProductCard";
import ProductCardSkeleton from "../features/products/ProductCardSkeleton";
import VehicleFilterBar from "../features/products/VehicleFilterBar";
import type { ProductFilters } from "../features/products/productTypes";
import ProductRow from "../features/products/ProductRow";
import { useRecentlyViewed } from "../features/products/useRecentlyViewed";
import SEO from "../components/SEO";

export default function ProductListPage() {
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
  });
  const { data, isLoading, isError } = useProducts(filters);
  const { data: recentlyViewed } = useRecentlyViewed();

  return (
    <Container sx={{ py: 4 }}>
      <SEO
        title="Auto Parts Catalog"
        description="Browse thousands of quality automotive parts by make, model, and category. Fast delivery across Bangladesh."
      />

      <Typography variant="h4" mb={3}>
        Auto Parts Catalog
      </Typography>

      <VehicleFilterBar filters={filters} onChange={setFilters} />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load products. Please try again.
        </Alert>
      )}

      <Grid container spacing={2}>
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
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

      {data?.products.length === 0 && !isLoading && (
        <Typography color="text.secondary" mt={4} textAlign="center">
          No products match your selected vehicle. Try different filters.
        </Typography>
      )}

      {data && data.pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={data.pagination.totalPages}
            page={filters.page ?? 1}
            onChange={(_, value) => setFilters({ ...filters, page: value })}
            color="primary"
          />
        </Box>
      )}
      <ProductRow title="Recently Viewed" products={recentlyViewed ?? []} />
    </Container>
  );
}
