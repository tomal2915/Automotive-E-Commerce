import { z } from "zod";
import { fatalExit } from "../utils/fatalExit.js";

// Declares every environment variable the app depends on, with its
// expected shape. If any required variable is missing or malformed,
// validateEnv() (called at startup) throws immediately with a clear
// message — instead of the app silently limping along and failing
// mysteriously later when that variable is actually used.
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("5000"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  ACCESS_TOKEN_SECRET: z
    .string()
    .min(
      32,
      "ACCESS_TOKEN_SECRET should be at least 32 characters for security",
    ),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(
      32,
      "REFRESH_TOKEN_SECRET should be at least 32 characters for security",
    ),

  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),
  SERVER_URL: z.string().url("SERVER_URL must be a valid URL"),

  SSLCOMMERZ_STORE_ID: z.string().min(1, "SSLCOMMERZ_STORE_ID is required"),
  SSLCOMMERZ_STORE_PASSWORD: z
    .string()
    .min(1, "SSLCOMMERZ_STORE_PASSWORD is required"),
  SSLCOMMERZ_IS_LIVE: z.enum(["true", "false"]).default("false"),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_PORT: z.string().min(1, "SMTP_PORT is required"),
  SMTP_USER: z.string().email("SMTP_USER must be a valid email"),
  SMTP_PASSWORD: z.string().min(1, "SMTP_PASSWORD is required"),
  EMAIL_FROM_NAME: z.string().default("Shop BD"),

  // Optional — the app should still run fine without these (error
  // tracking is a nice-to-have, not a hard requirement)
  SENTRY_DSN: z.string().url().optional().or(z.literal("")),
});

export const validateEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    let message = "Invalid or missing environment variables:\n";
    for (const issue of result.error.issues) {
      message += `  - ${issue.path.join(".")}: ${issue.message}\n`;
    }
    message += "\nFix your .env file and restart the server.";

    fatalExit(message);
    throw new Error("Environment validation failed");
  }

  return result.data;
};
