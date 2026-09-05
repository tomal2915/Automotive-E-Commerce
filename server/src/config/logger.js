import winston from "winston";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Human-readable format for local development console output
const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }), // ensures Error objects log their full stack trace, not just "[object Object]"
  printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  }),
);

// Structured JSON format for production — easier to parse/search in
// log aggregation tools (Render's log viewer, or a future service like
// Datadog/Logtail) than freeform text
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),

    // Persist logs to disk too — separate files for errors vs everything,
    // so you can quickly scan just the errors without noise
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
  // Catch errors that happen outside normal request handling (e.g. a
  // crash during startup) so they still get logged before the process exits
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" }),
  ],
});
