import { Box, LinearProgress, Typography } from "@mui/material";
import { calculateStrength } from "./calculateStrength";

interface Props {
  password: string;
}

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