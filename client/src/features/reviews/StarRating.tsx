import { Rating, Box, Typography } from "@mui/material";

interface Props {
  value: number;
  count?: number;
  size?: "small" | "medium" | "large";
}

// Read-only star display used on product cards and detail pages
export default function StarRating({ value, count, size = "small" }: Props) {
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Rating value={value} precision={0.5} readOnly size={size} />
      {count !== undefined && (
        <Typography variant="body2" color="text.secondary">
          ({count})
        </Typography>
      )}
    </Box>
  );
}