import { Chip } from "@mui/material";
import type { Order } from "./orderTypes";

const statusColors: Record<
  Order["status"],
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

export default function OrderStatusChip({
  status,
}: {
  status: Order["status"];
}) {
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={statusColors[status]}
      size="small"
    />
  );
}
