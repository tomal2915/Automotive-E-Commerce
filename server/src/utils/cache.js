import { redisClient } from "../config/redisClient.js";
import { logger } from "../config/logger.js";

// Cache-aside pattern: try Redis first; on a miss, run the real fetcher,
// store the result with a TTL, then return it. If Redis is unavailable
// (not configured, or connection drop), transparently falls through to
// calling the fetcher directly — a cache outage should degrade
// performance, never break the app.
export const getOrSetCache = async (key, ttlSeconds, fetcher) => {
  if (!redisClient) return fetcher();

  try {
    const cached = await redisClient.get(key);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    logger.warn(
      { error: error.message, key },
      "Cache read failed, falling through to source",
    );
  }

  const fresh = await fetcher();

  try {
    await redisClient.set(key, JSON.stringify(fresh), "EX", ttlSeconds);
  } catch (error) {
    logger.warn({ error: error.message, key }, "Cache write failed");
  }

  return fresh;
};

// Deletes every key matching a pattern — used to invalidate a group of
// cache entries at once (e.g. all "products:*" keys after a product changes)
export const invalidateCachePattern = async (pattern) => {
  if (!redisClient) return;
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) await redisClient.del(...keys);
};
