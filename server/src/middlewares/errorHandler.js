import { logger } from "../config/logger.js";

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

  // Don't leak internal error details (stack traces, DB connection
  // strings in error messages, etc.) to the client in production
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
