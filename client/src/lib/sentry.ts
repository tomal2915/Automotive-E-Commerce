import * as Sentry from "@sentry/react";

export const initSentry = () => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    return; // optional — skip if not configured (e.g. local dev)
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  });
};