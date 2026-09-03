import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  Chip,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import {
  setupTwoFactorRequest,
  verifySetupRequest,
  disableTwoFactorRequest,
} from "./twoFactorApi";

interface Props {
  isEnabled: boolean;
  onStatusChange: () => void; // called after enable/disable to refresh profile data
}

export default function TwoFactorSettings({
  isEnabled,
  onStatusChange,
}: Props) {
  const [step, setStep] = useState<"idle" | "scanning" | "backup-codes">(
    "idle",
  );
  const [qrCode, setQrCode] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);

  const setup = useMutation({
    mutationFn: setupTwoFactorRequest,
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setManualKey(data.manualEntryKey);
      setStep("scanning");
    },
  });

  const verifySetup = useMutation({
    mutationFn: () => verifySetupRequest(verifyCode),
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setStep("backup-codes");
      onStatusChange();
    },
  });

  const disable = useMutation({
    mutationFn: () => disableTwoFactorRequest(disablePassword, disableCode),
    onSuccess: () => {
      setShowDisableForm(false);
      setDisablePassword("");
      setDisableCode("");
      onStatusChange();
    },
  });

  const handleDone = () => {
    setStep("idle");
    setBackupCodes([]);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={1}>
        Two-Factor Authentication
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {isEnabled && step === "idle" && (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Two-factor authentication is enabled on your account.
          </Alert>

          {!showDisableForm ? (
            <Button
              color="warning"
              variant="outlined"
              onClick={() => setShowDisableForm(true)}
            >
              Disable 2FA
            </Button>
          ) : (
            <Box>
              {disable.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {(disable.error as any)?.response?.data?.message ||
                    "Failed to disable 2FA"}
                </Alert>
              )}
              <TextField
                label="Current Password"
                type="password"
                fullWidth
                sx={{ mb: 2 }}
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
              <TextField
                label="6-digit code from authenticator app"
                fullWidth
                sx={{ mb: 2 }}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
              />
              <Button
                color="error"
                variant="contained"
                onClick={() => disable.mutate()}
                disabled={disable.isPending}
                sx={{ mr: 1 }}
              >
                Confirm Disable
              </Button>
              <Button onClick={() => setShowDisableForm(false)}>Cancel</Button>
            </Box>
          )}
        </Box>
      )}

      {!isEnabled && step === "idle" && (
        <Box>
          <Typography color="text.secondary" mb={2}>
            Add an extra layer of security — you'll need a code from an
            authenticator app (like Google Authenticator or Authy) each time you
            log in.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setup.mutate()}
            disabled={setup.isPending}
          >
            {setup.isPending
              ? "Setting up..."
              : "Enable Two-Factor Authentication"}
          </Button>
        </Box>
      )}

      {step === "scanning" && (
        <Box>
          <Typography mb={2}>
            1. Scan this QR code with your authenticator app (Google
            Authenticator, Authy, etc.)
          </Typography>
          <Box textAlign="center" mb={2}>
            <img src={qrCode} alt="2FA QR Code" style={{ maxWidth: 200 }} />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mb={2}
          >
            Can't scan? Enter this key manually: <strong>{manualKey}</strong>
          </Typography>

          <Typography mb={1}>
            2. Enter the 6-digit code shown in your app:
          </Typography>
          {verifySetup.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(verifySetup.error as any)?.response?.data?.message ||
                "Invalid code"}
            </Alert>
          )}
          <TextField
            label="6-digit code"
            fullWidth
            sx={{ mb: 2 }}
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => verifySetup.mutate()}
            disabled={verifySetup.isPending || verifyCode.length !== 6}
          >
            Verify & Enable
          </Button>
        </Box>
      )}

      {step === "backup-codes" && (
        <Box>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Save these backup codes somewhere safe. Each can be used once if you
            lose access to your authenticator app. They won't be shown again.
          </Alert>
          <List
            dense
            sx={{ bgcolor: "background.default", borderRadius: 1, mb: 2 }}
          >
            {backupCodes.map((code) => (
              <ListItem key={code}>
                <Chip label={code} sx={{ fontFamily: "monospace" }} />
              </ListItem>
            ))}
          </List>
          <Button variant="contained" onClick={handleDone}>
            I've Saved These Codes
          </Button>
        </Box>
      )}
    </Paper>
  );
}
