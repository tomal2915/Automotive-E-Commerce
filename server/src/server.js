import "dotenv/config";
import { validateEnv } from "./config/envSchema.js";

// Validate BEFORE importing anything else that might read process.env
// at module-load time (like sslcommerz.js does) — if we imported app.js
// first, a bad config might already crash something before we get the
// chance to show our own clear error message
validateEnv();

const { default: connectDB } = await import("./config/db.js");
const { default: app } = await import("./app.js");
const { logger } = await import("./config/logger.js");

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(
    `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`,
  );
});
