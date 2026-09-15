import { Queue } from "bullmq";
import { redisClient } from "../config/redisClient.js";

// BullMQ needs its own connection config (not the shared ioredis
// instance directly) — but reuses the same Redis server
const connection = { host: redisClient?.options?.host, port: redisClient?.options?.port, password: redisClient?.options?.password };

export const emailQueue = new Queue("email", { connection });