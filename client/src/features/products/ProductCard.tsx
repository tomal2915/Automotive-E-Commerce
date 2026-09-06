import {
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Typography,
  Chip,
  Box,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useNavigate } from "react-router-dom";
import { useAddToCart } from "../cart/useAddToCart";
import { useWishlist } from "../wishlist/useWishlist";
import { useToggleWishlist } from "../wishlist/useToggleWishlist";
import AnimatedAddToCartButton from "../../components/AnimatedAddToCartButton";
import StarRating from "../reviews/StarRating";
import { formatCurrency } from "../../utils/formatCurrency";
import type { Product } from "./productTypes";

const PLACEHOLDER_IMAGE = "/placeholder-part.svg";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const { data: wishlist } = useWishlist();
  const toggleWishlist = useToggleWishlist();

  const imageSrc = product.images?.[0] || PLACEHOLDER_IMAGE;
  const isInWishlist =
    wishlist?.products.some((p) => p._id === product._id) ?? false;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ height: "100%" }}
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          transition: "box-shadow 0.2s ease",
          "&:hover": { boxShadow: 6 },
        }}
      >
        <motion.div
          whileTap={{ scale: 0.85 }}
          style={{ position: "absolute", top: 4, right: 4, zIndex: 1 }}
        >
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist.mutate({ product, isInWishlist });
            }}
            sx={{
              bgcolor: "rgba(0,0,0,0.4)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
            }}
            size="small"
          >
            {isInWishlist ? (
              <motion.div
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <FavoriteIcon fontSize="small" color="error" />
              </motion.div>
            ) : (
              <FavoriteBorderIcon fontSize="small" sx={{ color: "white" }} />
            )}
          </IconButton>
        </motion.div>

        <CardActionArea
          onClick={() => navigate(`/products/${product._id}`)}
          sx={{ flexGrow: 1 }}
        >
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
          <CardContent>
            <Typography variant="h6" noWrap>
              {product.title}
            </Typography>
            {product.make && product.model && (
              <Typography
                sx={{ variant: "body2", color: "text.secondary", mb: 1 }}
              >
                {product.make} {product.model}
                {product.yearRange &&
                  ` (${product.yearRange.start}-${product.yearRange.end})`}
              </Typography>
            )}
            {product.reviewCount > 0 && (
              <Box sx={{ mb: 1 }}>
                <StarRating
                  value={product.averageRating}
                  count={product.reviewCount}
                />
              </Box>
            )}
            <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
              <Chip label={product.category} size="small" />
              {product.stock > 0 ? (
                <Chip label="In Stock" size="small" color="success" />
              ) : (
                <Chip label="Out of Stock" size="small" color="error" />
              )}
            </Box>
            <Typography variant="h6" color="primary">
              {formatCurrency(product.price)}
            </Typography>
          </CardContent>
        </CardActionArea>

        <Box sx={{ p: 2, pt: 0 }}>
          <AnimatedAddToCartButton
            fullWidth
            variant="contained"
            disabled={product.stock === 0}
            isPending={addToCart.isPending}
            onAddToCart={() => addToCart.mutate({ product })}
          />
        </Box>
      </Card>
    </motion.div>
  );
}
