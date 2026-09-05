import { Box, Typography, Grid } from "@mui/material";
import ProductCard from "./ProductCard";
import type { Product } from "./productTypes";

interface Props {
  title: string;
  products: Product[];
}

// A horizontal-feeling section of product cards, reused for both
// "Related Products" and "Recently Viewed" sections
export default function ProductRow({ title, products }: Props) {
  if (products.length === 0) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography sx={{ variant: "h5", mb: 2 }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid key={product._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}