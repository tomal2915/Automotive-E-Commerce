import crypto from "crypto";

// Ensures every browser gets a persistent, unguessable device ID cookie.
// This is NOT a security boundary (a determined user can clear cookies),
// but it deters casual multi-accounting — most people won't bother.
export const ensureDeviceId = (req, res, next) => {
  let deviceId = req.cookies.deviceId;

  if (!deviceId) {
    deviceId = crypto.randomBytes(16).toString("hex");
    res.cookie("deviceId", deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years — effectively permanent
    });
  }

  req.deviceId = deviceId;
  next();
};