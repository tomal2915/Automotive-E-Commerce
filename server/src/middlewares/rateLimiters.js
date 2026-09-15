import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../config/redisClient.js";

const limitHandler = (req, res) => {
  res
    .status(429)
    .json({ message: "Too many requests. Please try again later." });
};

// Builds a Redis-backed store when Redis is configured (production),
// or falls back to express-rate-limit's default in-memory store
// (dev-only — in-memory counters are per-process, so with multiple
// server instances behind a load balancer they'd each track separately
// and effectively multiply the real limit by the instance count).
const makeStore = (prefix) =>
  redisClient
    ? new RedisStore({
        prefix: `rl:${prefix}:`,
        sendCommand: (...args) => redisClient.call(...args),
      })
    : undefined;

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
  store: makeStore("auth"),
});

export const emailActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
  store: makeStore("email"),
});

export const twoFactorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
  store: makeStore("2fa"),
});

export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
  store: makeStore("general"),
});
