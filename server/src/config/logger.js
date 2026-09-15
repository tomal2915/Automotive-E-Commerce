import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

// Fields that must NEVER appear in logs, no matter how deeply nested —
// Pino redacts these in-place with "[Redacted]" before the log line is
// even serialized, so a stray console.log-style mistake elsewhere can't
// leak a password/token into a log file that might be shipped off-box.
const REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.body.password",
  "req.body.currentPassword",
  "req.body.newPassword",
  "req.body.token",
  "*.password",
  "*.refreshToken",
  "*.accessToken",
  "*.twoFactorSecret",
  "*.twoFactorBackupCodes",
  "*.SSLCOMMERZ_STORE_PASSWORD",
  "*.SMTP_PASSWORD",
];

// pino.transport() spawns the actual log-writing (file rotation, pretty
// printing) in a separate worker thread — the main thread only ever
// does a cheap, synchronous "push this object into a queue" call, so
// logging never blocks request handling under load.
const transport = pino.transport({
  targets: [
    // Rotating, capped file transport — always on, even in dev, so file
    // rotation behavior itself gets exercised before it's ever relied on.
    {
      target: "pino-roll",
      level: "info",
      options: {
        file: "logs/app.log",
        frequency: "daily", // roll over to a new file once a day...
        size: "20m", // ...or once the current file hits 20MB, whichever comes first
        limit: { count: 14 }, // CAP: never keep more than 14 rotated files — old ones are deleted automatically
        mkdir: true,
      },
    },
    // A second, error-only file — lets you tail just the errors without
    // wading through info-level noise
    {
      target: "pino-roll",
      level: "error",
      options: {
        file: "logs/error.log",
        frequency: "daily",
        size: "20m",
        limit: { count: 14 },
        mkdir: true,
      },
    },
    // Console output — human-readable in dev, raw JSON in prod (so a log
    // aggregator like Render's log viewer or Datadog can parse it)
    isProd
      ? { target: "pino/file", level: "info", options: { destination: 1 } } // fd 1 = stdout, raw JSON
      : {
          target: "pino-pretty",
          level: "debug",
          options: { colorize: true, translateTime: "HH:MM:ss" },
        },
  ],
});

export const logger = pino(
  {
    level: isProd ? "info" : "debug",
    redact: { paths: REDACT_PATHS, censor: "[Redacted]" },
    // Every log line is a JSON object — "structured JSON" requirement.
    // base: null strips pino's default pid/hostname noise; add it back
    // deliberately if you deploy across multiple hosts and need to tell
    // them apart in aggregated logs.
    base: { service: "shop-api" },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);
