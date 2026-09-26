import mongoose from "mongoose";
import { logger } from "./logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Default Mongoose pool is 100 — fine for moderate traffic, but
      // at high concurrency, connections become the bottleneck before
      // CPU/memory does. These values are a reasonable production
      // starting point; tune upward only after observing actual
      // connection-pool exhaustion in metrics (Atlas provides this).
      maxPoolSize: 50, // per server INSTANCE — with N horizontally-scaled instances, total connections to Atlas = N × 50, so this must stay under Atlas's own connection limit for your tier
      minPoolSize: 5, // keeps a few warm connections ready even during idle periods, avoiding a cold-start delay on the next request after a lull
      maxIdleTimeMS: 30000, // closes idle connections after 30s, freeing them back to Atlas's connection limit
      serverSelectionTimeoutMS: 5000, // fail fast (5s) if MongoDB is unreachable, rather than hanging the request indefinitely
      socketTimeoutMS: 45000, // a single query is killed if it takes longer than 45s — catches runaway queries before they pile up
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

export default connectDB;
