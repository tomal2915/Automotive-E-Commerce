import { logger } from "../config/logger.js";
import { Sentry } from "../config/sentry.js";

// Express recognizes this as an error-handling middleware specifically
// because it has 4 parameters (err, req, res, next) — must be registered
// LAST, after all routes, so it catches anything that reaches it
export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id || "anonymous",
  });

  // Sentry already captured this via setupExpressErrorHandler, but we can
  // add extra context here if useful (e.g. tagging with the user ID)
  Sentry.setUser({ id: req.user?.id || "anonymous" });

  const isDev = process.env.NODE_ENV !== "production";

  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong. Please try again.",
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
