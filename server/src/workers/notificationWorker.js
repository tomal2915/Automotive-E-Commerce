import "dotenv/config";
import { Worker } from "bullmq";
import { redisClient } from "../config/redisClient.js";
import { logger } from "../config/logger.js";
import Notification from "../models/Notification.js";
import { emitToUser } from "../config/socket.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";

await connectDB(); // workers run as a separate process, so they need their own DB connection

const connection = {
  host: redisClient?.options?.host,
  port: redisClient?.options?.port,
  password: redisClient?.options?.password,
};

const worker = new Worker(
  "notification",
  async (job) => {
    const notification = await Notification.create(job.data);
    emitToUser(job.data.userId.toString(), "notification:new", notification);
  },
  { connection, concurrency: 10 },
);

worker.on("failed", (job, err) =>
  logger.error(
    { jobId: job?.id, error: err.message },
    "Notification job failed",
  ),
);

logger.info("Notification worker started");
