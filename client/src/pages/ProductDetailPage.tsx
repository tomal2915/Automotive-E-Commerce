import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Grid,
  Typography,
  Chip,
  Box,
  Button,
  CardMedia,
} from "@mui/material";
import { fetchProductById } from "../features/products/productApi";
import { useAddToCart } from "../features/cart/useAddToCart";
import StarRating from "../features/reviews/StarRating";
import ProductReviews from "../features/reviews/ProductReviews";
import ProductRow from "../features/products/ProductRow";
import { useRelatedProducts } from "../features/products/useRelatedProducts";
import { addToRecentlyViewed } from "../features/products/recentlyViewed";
import SEO from "../components/SEO";

const PLACEHOLDER_IMAGE = "/placeholder-part.svg";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const addToCart = useAddToCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  });

  const { data: related } = useRelatedProducts(id!);

  // Record this product as viewed once it has loaded — runs once per
  // product ID, not on every re-render
  useEffect(() => {
    if (id) {
      addToRecentlyViewed(id);
    }
  }, [id]);

  if (isLoading) return <Container sx={{ py: 4 }}>Loading...</Container>;
  if (!product) return <Container sx={{ py: 4 }}>Product not found</Container>;

  return (
    <Container sx={{ py: 4 }}>
      <SEO
        title={product.title}
        description={product.description.slice(0, 155)} // search engines truncate around here anyway
        image={product.images?.[0]}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.description,
          image: product.images?.[0],
          sku: product.partNumber,
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "USD",
            availability:
              product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
          aggregateRating:
            product.reviewCount > 0
              ? {
                  "@type": "AggregateRating",
                  ratingValue: product.averageRating,
                  reviewCount: product.reviewCount,
                }
              : undefined,
        }}
      />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CardMedia
            component="img"
            image={product.images?.[0] || PLACEHOLDER_IMAGE}
            alt={product.title}
            sx={{ borderRadius: 2, maxHeight: 400, objectFit: "cover" }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h4" component="h1" mb={1}>
            {product.title}
          </Typography>

          {product.reviewCount > 0 && (
            <Box mb={2}>
              <StarRating
                value={product.averageRating}
                count={product.reviewCount}
                size="medium"
              />
            </Box>
          )}

          <Typography variant="body1" color="text.secondary" mb={2}>
            {product.description}
          </Typography>

          <Box display="flex" gap={1} mb={2}>
            <Chip label={product.category} />
            <Chip label={`${product.make} ${product.model}`} />
            <Chip
              label={`${product.yearRange.start}-${product.yearRange.end}`}
            />
          </Box>

          <Typography variant="h4" color="primary" mb={2}>
            ${product.price.toFixed(2)}
          </Typography>

          <Button
            variant="contained"
            size="large"
            disabled={product.stock === 0 || addToCart.isPending}
            onClick={() => addToCart.mutate({ product })}
          >
            Add to Cart
          </Button>
        </Grid>
      </Grid>

      <ProductReviews productId={product._id} />

      <ProductRow title="Related Products" products={related ?? []} />
    </Container>
  );
}
