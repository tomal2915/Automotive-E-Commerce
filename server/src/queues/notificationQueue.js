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

export const notificationQueue = connection
  ? new Queue("notification", { connection })
  : {
      add: async (name) => {
        logger.warn(
          `Notification queue unavailable (Redis not configured) — dropped job "${name}"`,
        );
      },
    };
