import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Box, Paper, Typography, Alert, CircularProgress, Link as MuiLink } from "@mui/material";
import { verifyEmailRequest } from "../features/auth/authApi";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    verifyEmailRequest(token)
      .then((data) => {
        setStatus("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Verification failed");
      });
  }, [token]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: 400, textAlign: "center" }}>
        {status === "verifying" && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Verifying your email...</Typography>
          </>
        )}
        {status === "success" && (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
            <MuiLink component={RouterLink} to="/login">
              Go to Login
            </MuiLink>
          </>
        )}
        {status === "error" && (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {message}
            </Alert>
            <MuiLink component={RouterLink} to="/login">
              Back to Login
            </MuiLink>
          </>
        )}
      </Paper>
    </Box>
  );
}