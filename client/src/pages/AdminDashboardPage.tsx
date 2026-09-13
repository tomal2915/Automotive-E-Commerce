import { Suspense, lazy } from "react";
import { Container, Typography, Grid, Box, Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardBundle } from "../features/analytics/analyticsApi";
import SummaryCards from "../features/analytics/SummaryCards";
import OrderStatusWidget from "../features/analytics/OrderStatusWidget";
import LowStockWidget from "../features/analytics/LowStockWidget";
import PageTransition from "../components/PageTransition";

// Code-split the two Recharts-based components — Recharts is a heavy
// library to parse/execute, and this defers that cost out of the main
// bundle's initial render, splitting it into a separate chunk that loads
// only once the rest of the dashboard has already painted.
const RevenueTrendChart = lazy(
  () => import("../features/analytics/RevenueTrendChart"),
);
const TopProductsChart = lazy(
  () => import("../features/analytics/TopProductsChart"),
);

const ChartSkeleton = () => <Skeleton variant="rounded" height={300} />;

export default function AdminDashboardPage() {
  // ONE request instead of five — see Step "analytics bundle" fix
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-dashboard-bundle"],
    queryFn: fetchDashboardBundle,
  });

  if (isLoading) {
    return (
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Analytics Dashboard
        </Typography>
        <Skeleton variant="rounded" height={100} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={300} />
      </Container>
    );
  }

  return (
    <PageTransition>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Analytics Dashboard
        </Typography>

        <Box sx={{ mb: 3 }}>
          {data && <SummaryCards summary={data.summary} />}
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            {data && (
              <Suspense fallback={<ChartSkeleton />}>
                <RevenueTrendChart data={data.revenueTrend} />
              </Suspense>
            )}
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            {data && <OrderStatusWidget data={data.orderStatusBreakdown} />}
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            {data && (
              <Suspense fallback={<ChartSkeleton />}>
                <TopProductsChart data={data.topProducts} />
              </Suspense>
            )}
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            {data && <LowStockWidget data={data.lowStockProducts} />}
          </Grid>
        </Grid>
      </Container>
    </PageTransition>
  );
}
