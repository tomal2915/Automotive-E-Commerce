import "dotenv/config";
import { validateEnv } from "./config/envSchema.js";

validateEnv();

const { default: connectDB } = await import("./config/db.js");
const { default: app } = await import("./app.js");
const { logger } = await import("./config/logger.js");
const mongoose = (await import("mongoose")).default;

connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(
    `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`,
  );
});

// Graceful shutdown: on receiving a termination signal (SIGTERM from
// Render/Docker during a redeploy, or SIGINT from Ctrl+C locally),
// stop accepting new connections but let in-flight requests finish
// before actually exiting — prevents cutting off a checkout or payment
// webhook mid-processing.
const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async (err) => {
    if (err) {
      logger.error("Error during server close", { error: err.message });
      process.exit(1);
    }

    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed. Shutdown complete.");
      process.exit(0);
    } catch (closeError) {
      logger.error("Error closing MongoDB connection", {
        error: closeError.message,
      });
      process.exit(1);
    }
  });

  // Safety net: if something hangs and never finishes (a stuck request,
  // a connection that won't close), force-exit after a timeout rather
  // than leaving the process running forever in limbo
  setTimeout(() => {
    logger.error(
      "Forced shutdown after timeout — some connections did not close in time",
    );
    process.exit(1);
  }, 10000).unref(); // unref() lets Node exit naturally if this timer is the only thing left running
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Catch truly unexpected crashes too — log them before the process dies,
// since an uncaught exception otherwise exits Node silently (or via a
// default handler) without the context we'd want in the logs
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception — shutting down", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", {
    reason: reason?.message || reason,
  });
  process.exit(1);
});
