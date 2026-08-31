import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Typography, CircularProgress, Alert, Box } from "@mui/material";
import { api } from "../lib/api";

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const tranId = searchParams.get("tran_id");
  const [status, setStatus] = useState<"checking" | "paid" | "pending" | "error">(
    "checking",
  );

  useEffect(() => {
    if (!tranId) return;

    let attempts = 0;

    // Poll every 2s for up to ~20s while waiting for the IPN to land
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/orders/${tranId}`);
        if (res.data.order.status === "paid") {
          setStatus("paid");
          clearInterval(interval);
        } else if (attempts >= 10) {
          setStatus("pending");
          clearInterval(interval);
        }
      } catch {
        setStatus("error");
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [tranId]);

  return (
    <Container sx={{ py: 6, textAlign: "center" }}>
      {status === "checking" && (
        <Box>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Confirming your payment...</Typography>
        </Box>
      )}
      {status === "paid" && (
        <Alert severity="success">Payment successful! Your order is confirmed.</Alert>
      )}
      {status === "pending" && (
        <Alert severity="info">
          Still processing — this can take a moment. Check your orders page shortly.
        </Alert>
      )}
      {status === "error" && (
        <Alert severity="error">Something went wrong confirming your order.</Alert>
      )}
    </Container>
  );
}