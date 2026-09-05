import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import { resetPasswordRequest } from "../features/auth/authApi";
import PasswordStrengthMeter from "../features/auth/PasswordStrengthMeter";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mismatchError, setMismatchError] = useState("");

  const mutation = useMutation({
    mutationFn: () => resetPasswordRequest(token!, newPassword),
    onSuccess: () => {
      setTimeout(() => navigate("/login"), 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMismatchError("Passwords do not match");
      return;
    }
    setMismatchError("");
    mutation.mutate();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography sx={{ variant: "h5", mb: 3 }}>Reset Password</Typography>

        {mutation.isSuccess ? (
          <Alert severity="success">
            Password reset! Redirecting to login...
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {(mutation.isError || mismatchError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {mismatchError ||
                  (mutation.error as any)?.response?.data?.message ||
                  "Reset failed"}
              </Alert>
            )}

            <TextField
              label="New Password"
              type="password"
              fullWidth
              required
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordStrengthMeter password={newPassword} />

            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              required
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </Box>
        )}

        <Typography sx={{ variant: "body2", mt: 2 }}>
          <MuiLink component={RouterLink} to="/login">
            Back to Login
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}
