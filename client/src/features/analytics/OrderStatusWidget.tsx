import { Paper, Typography, Box, Chip } from "@mui/material";
import type { StatusBreakdown } from "./analyticsApi";

const statusColors: Record<
  string,
  "default" | "warning" | "success" | "info" | "error"
> = {
  pending: "warning",
  paid: "success",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
  return_requested: "warning",
  returned: "default",
  failed: "error",
};

export default function OrderStatusWidget({
  data,
}: {
  data: StatusBreakdown[];
}) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>
        Order Status Breakdown
      </Typography>
      <Box display="flex" flexDirection="column" gap={1.5}>
        {data.map((item) => (
          <Box
            key={item.status}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Chip
              label={item.status.replace("_", " ")}
              size="small"
              color={statusColors[item.status] || "default"}
            />
            <Typography variant="body2" fontWeight="bold">
              {item.count}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
