import nodemailer from "nodemailer";
import { logger } from "../config/logger.js"; // adjust relative path

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for port 465, false for 587 (uses STARTTLS instead)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify the SMTP connection once at startup, so a misconfigured .env
// shows up immediately in the logs instead of silently failing later
transporter.verify((error) => {
  if (error) {
    logger.error("SMTP connection failed:", error.message);
  } else {
    logger.info("SMTP server ready to send emails");
  }
});
