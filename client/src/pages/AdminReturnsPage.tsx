import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPendingReturns,
  reviewReturnRequestApi,
} from "../features/orders/orderApi";

export default function AdminReturnsPage() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["pending-returns"],
    queryFn: fetchPendingReturns,
  });
  const [notes, setNotes] = useState<Record<string, string>>({});

  const review = useMutation({
    mutationFn: ({
      orderId,
      decision,
    }: {
      orderId: string;
      decision: "approved" | "rejected";
    }) => reviewReturnRequestApi(orderId, decision, notes[orderId]),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pending-returns"] }),
  });

  if (isLoading) return <Container sx={{ py: 4 }}>Loading...</Container>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" mb={3}>
        Pending Return Requests
      </Typography>

      {!orders || orders.length === 0 ? (
        <Typography color="text.secondary">
          No pending return requests.
        </Typography>
      ) : (
        orders.map((order: any) => (
          <Card key={order._id} sx={{ mb: 2 }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="subtitle1">
                  {order.user?.name} ({order.user?.email})
                </Typography>
                <Chip label={order.transactionId} size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Items: {order.items.map((i: any) => i.title).join(", ")} —
                Total: ${order.totalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" mb={2}>
                <strong>Reason:</strong> {order.returnRequest.reason}
              </Typography>

              <TextField
                size="small"
                fullWidth
                label="Admin note (optional)"
                value={notes[order._id] || ""}
                onChange={(e) =>
                  setNotes({ ...notes, [order._id]: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() =>
                    review.mutate({ orderId: order._id, decision: "approved" })
                  }
                  disabled={review.isPending}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    review.mutate({ orderId: order._id, decision: "rejected" })
                  }
                  disabled={review.isPending}
                >
                  Reject
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}
