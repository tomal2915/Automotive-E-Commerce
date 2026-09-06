import "dotenv/config";
import { initSentry, Sentry } from "./config/sentry.js";

initSentry();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import { sanitizeInput } from "./middlewares/sanitizeInput.js";
import { ensureDeviceId } from "./middlewares/deviceFingerprint.js";
import { generalApiLimiter } from "./middlewares/rateLimiters.js";
import { generateSitemap } from "./controllers/sitemapController.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import twoFactorRoutes from "./routes/twoFactorRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(ensureDeviceId);
app.use(sanitizeInput);
app.use(hpp());

if (process.env.NODE_ENV !== "test") {
  app.use("/api", generalApiLimiter);
}

app.get("/sitemap.xml", generateSitemap);

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/2fa", twoFactorRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/categories", categoryRoutes);

// These two MUST be last — Express runs middleware top-to-bottom, so
// anything registered after notFoundHandler/errorHandler would never
// actually be reached by a request.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
