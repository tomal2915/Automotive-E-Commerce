import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyOrders } from "../features/orders/orderApi";
import OrderStatusChip from "../features/orders/OrderStatusChip";
import { useState } from "react";
import {
  cancelOrderRequest,
  requestReturnRequest,
} from "../features/orders/orderApi";

export default function MyOrdersPage() {
  const {
    data: orders,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const queryClient = useQueryClient();
  const [actionDialog, setActionDialog] = useState<{
    type: "cancel" | "return";
    orderId: string;
  } | null>(null);
  const [reason, setReason] = useState("");

  const cancelOrder = useMutation({
    mutationFn: () => cancelOrderRequest(actionDialog!.orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      setActionDialog(null);
      setReason("");
    },
  });

  const requestReturn = useMutation({
    mutationFn: () => requestReturnRequest(actionDialog!.orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      setActionDialog(null);
      setReason("");
    },
  });

  const handleConfirmAction = () => {
    if (actionDialog?.type === "cancel") cancelOrder.mutate();
    else requestReturn.mutate();
  };

  if (isLoading) return <Container sx={{ py: 4 }}>Loading orders...</Container>;

  return (
    <Container sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography sx={{ variant: "h4" }}>My Orders</Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>

      {!orders || orders.length === 0 ? (
        <Typography color="text.secondary">
          You haven't placed any orders yet.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {order.items.map((i) => i.title).join(", ")}
                  </TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <OrderStatusChip status={order.status} />
                  </TableCell>
                  <TableCell>
                    {["pending", "paid"].includes(order.status) && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() =>
                          setActionDialog({
                            type: "cancel",
                            orderId: order._id,
                          })
                        }
                      >
                        Cancel
                      </Button>
                    )}
                    {order.status === "delivered" && (
                      <Button
                        size="small"
                        onClick={() =>
                          setActionDialog({
                            type: "return",
                            orderId: order._id,
                          })
                        }
                      >
                        Return
                      </Button>
                    )}
                    {order.status === "return_requested" && (
                      <Typography variant="caption" color="text.secondary">
                        Return pending review
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)}>
        <DialogTitle>
          {actionDialog?.type === "cancel" ? "Cancel Order" : "Request Return"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 1 }}
          />
          {(cancelOrder.isError || requestReturn.isError) && (
            <Typography sx={{ color: "error", variant: "body2", mt: 1 }}>
              {((cancelOrder.error || requestReturn.error) as any)?.response
                ?.data?.message || "Action failed"}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={handleConfirmAction}
            disabled={
              !reason.trim() || cancelOrder.isPending || requestReturn.isPending
            }
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
