import Redis from "ioredis";
import { logger } from "./logger.js";

let isRedisReady = false;

export const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3, // a single command retries at most 3 times before failing — prevents a request hanging forever on a dead connection
      retryStrategy: (times) => {
        // Exponential backoff, capped at 10s — avoids hammering Redis
        // with reconnect attempts during an extended outage, while
        // still recovering quickly from a brief blip
        const delay = Math.min(times * 500, 10000);
        logger.warn(`Redis reconnect attempt ${times}, retrying in ${delay}ms`);
        return delay;
      },
      // Queue commands issued while disconnected, up to this many —
      // rather than either (a) rejecting instantly, or (b) queuing
      // unboundedly and risking a memory blowup during a long outage
      enableOfflineQueue: true,
      reconnectOnError: (err) => {
        // READONLY errors happen during a Redis failover (replica
        // promoted to primary) — worth a fresh reconnect attempt
        return err.message.includes("READONLY");
      },
    })
  : null;

if (redisClient) {
  redisClient.on("connect", () => {
    logger.info("Redis connecting...");
  });

  redisClient.on("ready", () => {
    isRedisReady = true;
    logger.info("Redis connected and ready");
  });

  redisClient.on("error", (err) => {
    logger.error({ err: err.message }, "Redis connection error");
  });

  redisClient.on("close", () => {
    isRedisReady = false;
    logger.warn("Redis connection closed");
  });

  redisClient.on("reconnecting", (delay) => {
    logger.warn(`Redis reconnecting in ${delay}ms`);
  });
} else {
  logger.warn(
    "REDIS_URL not set — rate limiting and caching will use in-memory fallback (NOT safe for multi-instance production)",
  );
}

// Lets any code (cache.js, health check) check current Redis health
// WITHOUT issuing a network round-trip (unlike redisClient.ping())
export const isRedisConnected = () => isRedisReady;
