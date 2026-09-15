import Redis from "ioredis";
import { logger } from "./logger.js";

// A single shared Redis connection, reused for both rate-limiting and
// caching (Step 68) — one connection pool instead of two separate ones.
export const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 3 })
  : null;

if (redisClient) {
  redisClient.on("error", (err) =>
    logger.error({ err }, "Redis connection error"),
  );
  redisClient.on("connect", () => logger.info("Redis connected"));
} else {
  // Graceful degradation for local dev without Redis configured — rate
  // limiting/caching fall back to in-memory, which is fine on a single
  // dev machine but MUST have REDIS_URL set in production
  logger.warn(
    "REDIS_URL not set — rate limiting and caching will use in-memory fallback (NOT safe for multi-instance production)",
  );
}
