import { Container, Typography, Grid } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  fetchSummary,
  fetchRevenueTrend,
  fetchTopProducts,
  fetchOrderStatusBreakdown,
  fetchLowStockProducts,
} from "../features/analytics/analyticsApi";
import SummaryCards from "../features/analytics/SummaryCards";
import RevenueTrendChart from "../features/analytics/RevenueTrendChart";
import TopProductsChart from "../features/analytics/TopProductsChart";
import OrderStatusWidget from "../features/analytics/OrderStatusWidget";
import LowStockWidget from "../features/analytics/LowStockWidget";

export default function AdminDashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: fetchSummary,
  });

  const { data: trend } = useQuery({
    queryKey: ["analytics-revenue-trend"],
    queryFn: () => fetchRevenueTrend(30),
  });

  const { data: topProducts } = useQuery({
    queryKey: ["analytics-top-products"],
    queryFn: () => fetchTopProducts(10),
  });

  const { data: statusBreakdown } = useQuery({
    queryKey: ["analytics-status-breakdown"],
    queryFn: fetchOrderStatusBreakdown,
  });

  const { data: lowStock } = useQuery({
    queryKey: ["analytics-low-stock"],
    queryFn: () => fetchLowStockProducts(5),
  });

  if (loadingSummary)
    return <Container sx={{ py: 4 }}>Loading dashboard...</Container>;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography sx={{ variant: "h4", mb: 3 }}>Analytics Dashboard</Typography>

      {summary && <SummaryCards summary={summary} />}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          {trend && <RevenueTrendChart data={trend} />}
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          {statusBreakdown && <OrderStatusWidget data={statusBreakdown} />}
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          {topProducts && <TopProductsChart data={topProducts} />}
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          {lowStock && <LowStockWidget data={lowStock} />}
        </Grid>
      </Grid>
    </Container>
  );
}
