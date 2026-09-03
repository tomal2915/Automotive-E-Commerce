import { api } from "../../lib/api";

export const setupTwoFactorRequest = async (): Promise<{
  qrCode: string;
  manualEntryKey: string;
}> => {
  const res = await api.post("/2fa/setup");
  return res.data;
};

export const verifySetupRequest = async (
  code: string,
): Promise<{ backupCodes: string[] }> => {
  const res = await api.post("/2fa/verify-setup", { code });
  return res.data;
};

export const disableTwoFactorRequest = async (
  password: string,
  code: string,
) => {
  const res = await api.post("/2fa/disable", { password, code });
  return res.data;
};

export const verifyTwoFactorLoginRequest = async (
  twoFactorToken: string,
  code: string,
  isBackupCode: boolean,
) => {
  const res = await api.post("/2fa/login-verify", {
    twoFactorToken,
    code,
    isBackupCode,
  });
  return res.data;
};
