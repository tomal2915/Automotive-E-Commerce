import rateLimit from "express-rate-limit";

// Generic response shape for all rate-limit rejections
const limitHandler = (req, res) => {
  res
    .status(429)
    .json({ message: "Too many requests. Please try again later." });
};

// Strict — login, register: prevents credential-stuffing and account-creation spam
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
});

// Very strict — forgot-password, resend-verification: these trigger an
// email send, so abuse here is both a spam vector and a cost (SMTP quota)
export const emailActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
});

// Moderate — 2FA verification: enough attempts for a real user to retry
// a typo, but not enough to brute-force a 6-digit TOTP code
export const twoFactorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
});

// General API — generous, just a backstop against runaway scripts/bots
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
});
