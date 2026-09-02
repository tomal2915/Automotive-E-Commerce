import { Box, LinearProgress, Typography } from "@mui/material";

interface Props {
  password: string;
}

const calculateStrength = (password: string): { score: number; label: string; color: "error" | "warning" | "success" } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) score++;

  if (score <= 2) return { score: (score / 5) * 100, label: "Weak", color: "error" };
  if (score <= 4) return { score: (score / 5) * 100, label: "Medium", color: "warning" };
  return { score: 100, label: "Strong", color: "success" };
};

export default function PasswordStrengthMeter({ password }: Props) {
  if (!password) return null;

  const { score, label, color } = calculateStrength(password);

  return (
    <Box mt={0.5}>
      <LinearProgress variant="determinate" value={score} color={color} sx={{ height: 6, borderRadius: 3 }} />
      <Typography variant="caption" color={`${color}.main`}>
        {label} password
      </Typography>
    </Box>
  );
}