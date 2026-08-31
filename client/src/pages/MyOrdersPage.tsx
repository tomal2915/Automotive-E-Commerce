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
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchMyOrders } from "../features/orders/orderApi";
import OrderStatusChip from "../features/orders/OrderStatusChip";

export default function MyOrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
  });

  if (isLoading) return <Container sx={{ py: 4 }}>Loading orders...</Container>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" mb={3}>
        My Orders
      </Typography>

      {!orders || orders.length === 0 ? (
        <Typography color="text.secondary">You haven't placed any orders yet.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{order.items.map((i) => i.title).join(", ")}</TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <OrderStatusChip status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}