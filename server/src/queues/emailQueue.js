import { Queue } from "bullmq";
import { redisClient } from "../config/redisClient.js";
import { logger } from "../config/logger.js";

const connection = redisClient
  ? {
      host: redisClient.options.host,
      port: redisClient.options.port,
      password: redisClient.options.password,
    }
  : null;

// A no-op stand-in used whenever Redis isn't configured (local dev
// without Redis, or the test suite) — callers call `.add()` exactly the
// same way either way; the job is just dropped with a warning instead
// of BullMQ silently attempting a real connection to a default
// localhost Redis that may or may not exist.
export const emailQueue = connection
  ? new Queue("email", { connection })
  : {
      add: async (name) => {
        logger.warn(
          `Email queue unavailable (Redis not configured) — dropped job "${name}"`,
        );
      },
    };
