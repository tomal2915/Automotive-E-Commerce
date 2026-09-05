import * as Sentry from "@sentry/node";

export const initSentry = () => {
  if (!process.env.SENTRY_DSN) {
    return; // optional — skip if not configured
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  });
};

export { Sentry };
