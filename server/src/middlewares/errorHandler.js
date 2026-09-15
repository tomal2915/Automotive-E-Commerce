import { logger } from "../config/logger.js";
import { Sentry } from "../config/sentry.js";

export const errorHandler = (err, req, res, next) => {
  const log = req.log || logger; // fallback if traceIdMiddleware somehow didn't run
  log.error({ err, stack: err.stack, userId: req.user?.id }, err.message);

  Sentry.captureException(err);

  const isDev = process.env.NODE_ENV !== "production";
  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong. Please try again.",
    traceId: res.getHeader("x-trace-id"), // lets the user report a specific error, and you grep for exactly that traceId in logs
    ...(isDev && { stack: err.stack }),
  });
};

// Catches requests to routes that don't exist at all (404) — placed
// right before errorHandler, after all real routes
export const notFoundHandler = (req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.path} not found` });
};
