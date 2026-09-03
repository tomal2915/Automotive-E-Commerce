import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import { loginSchema, type LoginFormData } from "../features/auth/authSchemas";
import { loginRequest } from "../features/auth/authApi";
import { setAccessToken } from "../lib/tokenStore";
import { useAuthStore } from "../store/authStore";
import TwoFactorLoginStep from "../features/twoFactor/TwoFactorLoginStep";

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [showResend, setShowResend] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data: any) => {
      if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setTwoFactorToken(data.twoFactorToken);
        return;
      }
      setAccessToken(data.accessToken);
      setUser(data.user);
      navigate("/");
    },
    onError: (error: any) => {
      setShowResend(error?.response?.data?.code === "EMAIL_NOT_VERIFIED");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data);
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
        <Typography variant="h5" mb={3}>
          Login
        </Typography>

        {requiresTwoFactor ? (
          <TwoFactorLoginStep
            twoFactorToken={twoFactorToken}
            onSuccess={(data) => {
              setAccessToken(data.accessToken);
              setUser(data.user);
              navigate("/");
            }}
          />
        ) : (
          <>
            {mutation.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {(mutation.error as any)?.response?.data?.message ||
                  "Invalid email or password"}
                {showResend && (
                  <MuiLink
                    component={RouterLink}
                    to="/check-inbox"
                    state={{ email: watch("email") }}
                    sx={{ display: "block", mt: 1 }}
                  >
                    Resend verification email
                  </MuiLink>
                )}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </Box>

            <Typography variant="body2" mt={2}>
              Don't have an account? <Link to="/register">Register</Link>
            </Typography>
            <Typography variant="body2" mt={1}>
              <MuiLink component={RouterLink} to="/forgot-password">
                Forgot password?
              </MuiLink>
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
}
