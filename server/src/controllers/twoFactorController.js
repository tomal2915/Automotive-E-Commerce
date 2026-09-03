import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import { getRefreshCookieOptions } from "../utils/cookieOptions.js";

// Hashes a backup code the same way we hash passwords — so even if the DB
// leaks, the raw one-time-use recovery codes aren't exposed
const hashBackupCode = async (code) => bcrypt.hash(code, 10);

const generateBackupCodes = () => {
  // 10 human-readable codes like "A1B2-C3D4"
  return Array.from({ length: 10 }, () => {
    const raw = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
  });
};

// @route POST /api/v1/2fa/setup
// Step 1 of enabling 2FA: generates a secret + QR code, but does NOT
// enable 2FA yet — the user must confirm with a valid code first
// (proves they actually scanned it correctly) before it's turned on
export const setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.twoFactorEnabled) {
      return res
        .status(400)
        .json({ message: "Two-factor authentication is already enabled" });
    }

    const secret = speakeasy.generateSecret({
      name: `AutoParts BD (${user.email})`,
      length: 20,
    });

    // Store the secret temporarily (unconfirmed) — it only becomes
    // "active" once verifyAndEnableTwoFactor succeeds
    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      qrCode: qrCodeDataUrl, // <img src={qrCode}> on the frontend
      manualEntryKey: secret.base32, // fallback if the user can't scan the QR
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/2fa/verify-setup
// Step 2: user enters the 6-digit code from their authenticator app to
// confirm the setup actually worked — THIS is what turns 2FA on
export const verifyAndEnableTwoFactor = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id).select("+twoFactorSecret");

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        message: "No pending 2FA setup found. Please start setup again.",
      });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: code,
      window: 1, // allows the code from 1 step before/after, tolerating small clock drift
    });

    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Invalid code. Please try again." });
    }

    const backupCodes = generateBackupCodes();
    const hashedCodes = await Promise.all(backupCodes.map(hashBackupCode));

    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = hashedCodes;
    await user.save();

    res.json({
      message: "Two-factor authentication enabled successfully",
      backupCodes, // shown ONCE, in plaintext — user must save these now
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/2fa/disable
// Requires the current password AND a valid 2FA code — disabling 2FA is
// a security-sensitive action, so a stolen session alone shouldn't be
// enough to turn off the account's protection
export const disableTwoFactor = async (req, res) => {
  try {
    const { password, code } = req.body;

    const user = await User.findById(req.user.id).select(
      "+password +twoFactorSecret",
    );

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: code,
      window: 1,
    });

    if (!isValid) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    await user.save();

    res.json({ message: "Two-factor authentication disabled" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/2fa/login-verify
// Step 2 of a 2FA login: exchanges a valid twoFactorToken + correct code
// for real access/refresh tokens — this is where the actual login completes
export const verifyTwoFactorLogin = async (req, res) => {
  try {
    const { twoFactorToken, code, isBackupCode } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(twoFactorToken, process.env.ACCESS_TOKEN_SECRET);
    } catch {
      return res
        .status(401)
        .json({
          message: "This login session has expired. Please log in again.",
        });
    }

    // Reject any token that wasn't specifically issued for 2FA login —
    // e.g. a regular access token stolen and replayed here
    if (decoded.purpose !== "2fa-login") {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.userId).select(
      "+twoFactorSecret +twoFactorBackupCodes",
    );
    if (!user || !user.twoFactorEnabled) {
      return res.status(401).json({ message: "Invalid request" });
    }

    let isValid = false;

    if (isBackupCode) {
      // Check the provided code against each hashed backup code —
      // if it matches one, consume it (one-time use) and remove it
      for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
        const matches = await bcrypt.compare(
          code,
          user.twoFactorBackupCodes[i],
        );
        if (matches) {
          isValid = true;
          user.twoFactorBackupCodes.splice(i, 1); // consume — can't be reused
          await user.save();
          break;
        }
      }
    } else {
      isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: code,
        window: 1,
      });
    }

    if (!isValid) {
      return res.status(401).json({ message: "Invalid verification code" });
    }

    // Code confirmed — now issue the actual session, same as a normal login
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
