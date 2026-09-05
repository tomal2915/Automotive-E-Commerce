import * as Sentry from "@sentry/node";

export const initSentry = () => {
  if (!process.env.SENTRY_DSN) {
    // Sentry is optional — don't crash if it's not configured (e.g. local dev)
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0, // sample 20% of transactions in prod to control cost/volume
  });
};

export { Sentry };
