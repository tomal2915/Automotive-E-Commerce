import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import type { Product } from "./productTypes";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" noWrap>
          {product.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          {product.make} {product.model} ({product.yearRange.start}-
          {product.yearRange.end})
        </Typography>
        <Box display="flex" gap={1} mb={1}>
          <Chip label={product.category} size="small" />
          {product.stock > 0 ? (
            <Chip label="In Stock" size="small" color="success" />
          ) : (
            <Chip label="Out of Stock" size="small" color="error" />
          )}
        </Box>
        <Typography variant="h6" color="primary">
          ${product.price.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  );
}