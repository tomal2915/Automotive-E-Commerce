import "dotenv/config";
import { validateEnv } from "./config/envSchema.js";
import { fatalExit } from "./utils/fatalExit.js";

validateEnv();

const { default: connectDB } = await import("./config/db.js");
const { default: app } = await import("./app.js");
const { logger } = await import("./config/logger.js");
const mongoose = (await import("mongoose")).default;

try {
  await connectDB();
} catch (error) {
  fatalExit("Failed to start server due to database connection error", error);
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(
    `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`,
  );
});

const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async (err) => {
    if (err) {
      fatalExit("Error during server close", err);
      return;
    }

    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed. Shutdown complete.");
      process.exit(0);
    } catch (closeError) {
      fatalExit("Error closing MongoDB connection", closeError);
    }
  });

  setTimeout(() => {
    fatalExit(
      "Forced shutdown after timeout — some connections did not close in time",
    );
  }, 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  fatalExit("Uncaught Exception — shutting down", error);
});

process.on("unhandledRejection", (reason) => {
  fatalExit("Unhandled Promise Rejection", reason);
});
