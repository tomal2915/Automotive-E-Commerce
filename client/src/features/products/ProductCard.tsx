import {
  Card,
  CardContent,
  CardActions,
  CardActionArea,
  CardMedia,
  Typography,
  Chip,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useNavigate } from "react-router-dom";
import { useAddToCart } from "../cart/useAddToCart";
import { useWishlist } from "../wishlist/useWishlist";
import { useToggleWishlist } from "../wishlist/useToggleWishlist";
import type { Product } from "./productTypes";
import StarRating from "../reviews/StarRating";
import { formatCurrency } from "../../utils/formatCurrency"; // adjust relative path per file

const PLACEHOLDER_IMAGE = "/placeholder-part.svg";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addToCart = useAddToCart();
  const { data: wishlist } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const navigate = useNavigate();

  const imageSrc = product.images?.[0] || PLACEHOLDER_IMAGE;
  const isInWishlist =
    wishlist?.products.some((p) => p._id === product._id) ?? false;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist.mutate({ product, isInWishlist });
        }}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          zIndex: 1,
          bgcolor: "rgba(0,0,0,0.4)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
        }}
        size="small"
      >
        {isInWishlist ? (
          <FavoriteIcon fontSize="small" color="error" />
        ) : (
          <FavoriteBorderIcon fontSize="small" sx={{ color: "white" }} />
        )}
      </IconButton>

      <CardActionArea onClick={() => navigate(`/products/${product._id}`)}>
        <CardMedia
          component="img"
          height="160"
          image={imageSrc}
          alt={product.title}
          sx={{ objectFit: "cover", bgcolor: "background.default" }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== window.location.origin + PLACEHOLDER_IMAGE) {
              target.src = PLACEHOLDER_IMAGE;
            }
          }}
        />

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap>
            {product.title}
          </Typography>

          <Typography sx={{ variant: "body2", color: "text.secondary", mb: 1 }}>
            {product.make} {product.model}
            {product.yearRange &&
              ` (${product.yearRange.start}-${product.yearRange.end})`}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <Chip label={product.category} size="small" />
            {product.stock > 0 ? (
              <Chip label="In Stock" size="small" color="success" />
            ) : (
              <Chip label="Out of Stock" size="small" color="error" />
            )}
          </Box>
          <Typography sx={{ variant: "h6", color: "primary" }}>
            {formatCurrency(product.price)}
          </Typography>

          {product.reviewCount > 0 && (
            <StarRating
              value={product.averageRating}
              count={product.reviewCount}
            />
          )}
        </CardContent>
      </CardActionArea>
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
