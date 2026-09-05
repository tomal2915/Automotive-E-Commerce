import "dotenv/config";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { sanitizeInput } from "./middlewares/sanitizeInput.js";
import hpp from "hpp";
import connectDB from "./config/db.js";
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
import { generalApiLimiter } from "./middlewares/rateLimiters.js";
import { ensureDeviceId } from "./middlewares/deviceFingerprint.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

// dotenv.config();
connectDB();

const app = express();

// Core middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allows Cloudinary images to load from a different origin
  }),
);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeInput); // strips any key starting with "$" or containing "." from req.body/query/params
app.use(hpp()); // prevents duplicate query params (e.g. ?price=10&price=20) from causing unexpected behavior
app.use(ensureDeviceId);

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
app.use("/api", generalApiLimiter); // applies to everything under /api, specific routes above override with their own stricter limiter
app.use("/api/v1/analytics", analyticsRoutes); // admin-only analytics routes

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
