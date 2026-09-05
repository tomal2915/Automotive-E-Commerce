import { useState } from "react";
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  Divider,
  IconButton,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProductReviews, createReviewRequest, deleteReviewRequest } from "./reviewApi";
import { useAuthStore } from "../../store/authStore";

interface Props {
  productId: string;
}

export default function ProductReviews({ productId }: Props) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchProductReviews(productId),
  });

  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState("");

  const createReview = useMutation({
    mutationFn: () => createReviewRequest(productId, { rating: rating || 0, comment }),
    onSuccess: () => {
      setRating(0);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      // Product's averageRating/reviewCount changed too — refresh product data
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteReview = useMutation({
    mutationFn: deleteReviewRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const alreadyReviewed = reviews?.some((r) => r.user._id === currentUser?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    createReview.mutate();
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography sx={{ variant: "h5", mb: 2 }}>
        Reviews {reviews && `(${reviews.length})`}
      </Typography>

      {/* Review form — only shown to logged-in users who haven't reviewed yet */}
      {currentUser && !alreadyReviewed && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          {createReview.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(createReview.error as any)?.response?.data?.message || "Failed to submit review"}
            </Alert>
          )}
          <Typography component="legend" sx={{ variant: "body2" }}>
            Your Rating
          </Typography>
          <Rating
            value={rating}
            onChange={(_, value) => setRating(value)}
            size="large"
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 1, mb: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={createReview.isPending || !rating || !comment.trim()}
          >
            {createReview.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </Box>
      )}

      {alreadyReviewed && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You've already reviewed this product.
        </Alert>
      )}

      {isLoading ? (
        <Typography color="text.secondary">Loading reviews...</Typography>
      ) : !reviews || reviews.length === 0 ? (
        <Typography color="text.secondary">No reviews yet. Be the first to review!</Typography>
      ) : (
        <List>
          {reviews.map((review) => (
            <Box key={review._id}>
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  (currentUser?.id === review.user._id || currentUser?.role === "admin") && (
                    <IconButton edge="end" onClick={() => deleteReview.mutate(review._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <Avatar src={review.user.avatar} sx={{ mr: 2 }}>
                  {review.user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ variant: "subtitle2" }}>{review.user.name}</Typography>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography sx={{ variant: "body2", mt: 0.5 }}>
                    {review.comment}
                  </Typography>
                  <Typography sx={{ variant: "caption", color: "text.secondary" }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </ListItem>
              <Divider component="li" />
            </Box>
          ))}
        </List>
      )}
    </Box>
  );
}