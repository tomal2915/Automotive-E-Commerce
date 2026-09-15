import { Queue } from "bullmq";
import { redisClient } from "../config/redisClient.js";

const connection = { host: redisClient?.options?.host, port: redisClient?.options?.port, password: redisClient?.options?.password };

export const notificationQueue = new Queue("notification", { connection });