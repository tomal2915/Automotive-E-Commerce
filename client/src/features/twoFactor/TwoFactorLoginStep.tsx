import { useState } from "react";
import { Box, TextField, Button, Alert, Typography, Link } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { verifyTwoFactorLoginRequest } from "./twoFactorApi";

interface Props {
  twoFactorToken: string;
  onSuccess: (data: any) => void;
}

export default function TwoFactorLoginStep({
  twoFactorToken,
  onSuccess,
}: Props) {
  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const verify = useMutation({
    mutationFn: () =>
      verifyTwoFactorLoginRequest(twoFactorToken, code, useBackupCode),
    onSuccess,
  });

  return (
    <Box>
      <Typography sx={{ mb: 2 }}>
        Enter the{" "}
        {useBackupCode
          ? "backup code"
          : "6-digit code from your authenticator app"}
        .
      </Typography>

      {verify.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(verify.error as any)?.response?.data?.message ||
            "Verification failed"}
        </Alert>
      )}

      <TextField
        label={useBackupCode ? "Backup Code" : "6-digit code"}
        fullWidth
        margin="normal"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoFocus
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => verify.mutate()}
        disabled={verify.isPending || !code}
      >
        {verify.isPending ? "Verifying..." : "Verify"}
      </Button>

      <Typography sx={{ variant: "body2", mt: 2 }}>
        <Link
          component="button"
          type="button"
          onClick={() => setUseBackupCode(!useBackupCode)}
        >
          {useBackupCode
            ? "Use authenticator code instead"
            : "Use a backup code instead"}
        </Link>
      </Typography>
    </Box>
  );
}
