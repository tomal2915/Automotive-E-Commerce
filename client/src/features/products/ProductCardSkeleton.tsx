import { Card, CardContent, Skeleton } from "@mui/material";

// Mirrors the ProductCard layout exactly so there's zero layout
// shift (CLS) when real data replaces the skeleton
export default function ProductCardSkeleton() {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Skeleton variant="text" height={32} width="80%" />
        <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={24} width={100} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={32} width="40%" />
      </CardContent>
    </Card>
  );
}