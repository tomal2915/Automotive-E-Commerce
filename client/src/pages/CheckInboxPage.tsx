import { useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { resendVerificationRequest } from "../features/auth/authApi";

export default function CheckInboxPage() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";

  const resend = useMutation({
    mutationFn: () => resendVerificationRequest(email),
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper sx={{ p: 4, width: 420, textAlign: "center" }}>
        <Typography sx={{ variant: "h5", mb: 2 }}>Check Your Inbox</Typography>
        <Typography sx={{ color: "text.secondary", mb: 3 }}>
          We've sent a verification link to{" "}
          <strong>{email || "your email"}</strong>. Click the link to activate
          your account.
        </Typography>

        {resend.isSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Verification email resent — check your inbox.
          </Alert>
        )}

        <Button
          variant="outlined"
          onClick={() => resend.mutate()}
          disabled={resend.isPending || !email}
        >
          {resend.isPending ? "Sending..." : "Resend Email"}
        </Button>

        <Typography sx={{ variant: "body2", mt: 3 }}>
          <MuiLink component={RouterLink} to="/login">
            Back to Login
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}
