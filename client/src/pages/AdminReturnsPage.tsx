import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  TextField,
  Pagination,
} from "@mui/material";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPendingReturns,
  reviewReturnRequestApi,
} from "../features/orders/orderApi";
import PageTransition from "../components/PageTransition";

export default function AdminReturnsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["pending-returns", page],
    queryFn: () => fetchPendingReturns({ page }),
  });
  const orders = data?.orders;
  const [notes, setNotes] = useState<Record<string, string>>({});

  const review = useMutation({
    mutationFn: ({
      orderId,
      decision,
    }: {
      orderId: string;
      decision: "approved" | "rejected";
    }) => reviewReturnRequestApi(orderId, decision, notes[orderId]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-returns"] });
      // reviewed items disappear from this list — if the current page
      // becomes empty, step back one page rather than showing a blank state
      if (orders && orders.length === 1 && page > 1) setPage((p) => p - 1);
    },
  });

  if (isLoading)
    return (
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>Loading...</Container>
    );

  return (
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
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
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle1">
                    {order.user?.name} ({order.user?.email})
                  </Typography>
                  <Chip label={order.transactionId} size="small" />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Items: {order.items.map((i: any) => i.title).join(", ")} —
                  Total: ${order.totalAmount.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
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

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() =>
                      review.mutate({
                        orderId: order._id,
                        decision: "approved",
                      })
                    }
                    disabled={review.isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      review.mutate({
                        orderId: order._id,
                        decision: "rejected",
                      })
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

        {data && data.pagination.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={data.pagination.totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
            />
          </Box>
        )}
      </Container>
    </PageTransition>
  );
}
