import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  Button,
  CardMedia,
} from "@mui/material";
import { useAddToCart } from "../cart/useAddToCart";
import type { Product } from "./productTypes";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addToCart = useAddToCart();

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" noWrap>
          {product.title}
        </Typography>
        <CardMedia
          component="img"
          height="160"
          image={product.images?.[0] || "/placeholder-part.png"}
          alt={product.title}
        />
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
      <CardActions>
        <Button
          fullWidth
          variant="contained"
          disabled={product.stock === 0 || addToCart.isPending}
          onClick={() => addToCart.mutate({ product })}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
}
