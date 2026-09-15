import "dotenv/config";
import { Worker } from "bullmq";
import { redisClient } from "../config/redisClient.js";
import { logger } from "../config/logger.js";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
} from "../services/emailService.js";

const connection = {
  host: redisClient?.options?.host,
  port: redisClient?.options?.port,
  password: redisClient?.options?.password,
};

// Processes jobs OFF the main API server process entirely — a slow SMTP
// provider or a burst of 10,000 emails never blocks a single request
// handler, because this runs as its own OS process.
const worker = new Worker(
  "email",
  async (job) => {
    if (job.name === "order-confirmation") {
      await sendOrderConfirmationEmail(job.data.order, job.data.email);
    } else if (job.name === "order-status") {
      await sendOrderStatusEmail(
        job.data.order,
        job.data.email,
        job.data.statusMessage,
      );
    }
  },
  { connection, concurrency: 5 },
);

worker.on("completed", (job) =>
  logger.info({ jobId: job.id, name: job.name }, "Email job completed"),
);
worker.on("failed", (job, err) =>
  logger.error({ jobId: job?.id, error: err.message }, "Email job failed"),
);

logger.info("Email worker started");
