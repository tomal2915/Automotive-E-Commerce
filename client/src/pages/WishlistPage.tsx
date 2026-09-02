import { Container, Typography, Grid } from "@mui/material";
import { useWishlist } from "../features/wishlist/useWishlist";
import ProductCard from "../features/products/ProductCard";

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();

  if (isLoading)
    return <Container sx={{ py: 4 }}>Loading wishlist...</Container>;

  const products = wishlist?.products ?? [];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" mb={3}>
        My Wishlist
      </Typography>

      {products.length === 0 ? (
        <Typography color="text.secondary">
          Your wishlist is empty. Tap the heart icon on any product to save it
          here.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid key={product._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
