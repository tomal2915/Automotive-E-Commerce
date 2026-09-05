import { useState } from "react";
import { Container, Typography, MenuItem, Select, Box } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllOrders,
  updateOrderStatusRequest,
} from "../features/orders/orderApi";
import OrderStatusChip from "../features/orders/OrderStatusChip";
import type { Order } from "../features/orders/orderTypes";
import { formatCurrency } from "../utils/formatCurrency";

const STATUS_OPTIONS: Order["status"][] = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "failed",
  "cancelled",
];

export default function AdminOrdersPage() {
  const [page, setPage] = useState(0); // DataGrid pagination is 0-indexed
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page],
    queryFn: () => fetchAllOrders({ page: page + 1, status: undefined }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatusRequest(orderId, status),
    onSuccess: () => {
      // Re-fetch the current page so the grid reflects the change
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const columns: GridColDef[] = [
    {
      field: "customer",
      headerName: "Customer",
      flex: 1,
      valueGetter: (_value, row: Order) => row.user?.name ?? "Unknown",
    },
    {
      field: "totalAmount",
      headerName: "Total",
      width: 120,
      valueFormatter: (value: number) => formatCurrency(value),
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 150,
      valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => <OrderStatusChip status={params.value} />,
    },
    {
      field: "actions",
      headerName: "Update Status",
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Select
          size="small"
          value=""
          displayEmpty
          onChange={(e) =>
            updateStatus.mutate({
              orderId: params.row._id,
              status: e.target.value,
            })
          }
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="" disabled>
            Change to...
          </MenuItem>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </MenuItem>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography sx={{ variant: "h4", mb: 3 }}>Manage Orders</Typography>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={data?.orders ?? []}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          paginationMode="server"
          rowCount={data?.pagination.total ?? 0}
          paginationModel={{ page, pageSize: 20 }}
          onPaginationModelChange={(model) => setPage(model.page)}
          pageSizeOptions={[20]}
          disableRowSelectionOnClick
        />
      </Box>
    </Container>
  );
}
