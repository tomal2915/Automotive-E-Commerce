import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

// @route POST /api/v1/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Explicitly select password since the schema has select: false
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save the new refresh token to the DB (needed for rotation later)
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Refresh token goes into an HttpOnly cookie (per blueprint)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/auth/refresh-token
export const refreshTokenHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the user that currently owns this refresh token
    const foundUser = await User.findOne({
      "refreshTokens.token": refreshToken,
    });

    // --- Reuse Detection Guard ---
    // If no user owns this token, it was already rotated/removed before.
    // Someone is trying to reuse an old token -> possible theft.
    if (!foundUser) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        // HACK DETECTED: wipe all refresh tokens for this user
        // This forces logout on every device/session for that account
        await User.findByIdAndUpdate(decoded.userId, { refreshTokens: [] });
      } catch {
        // Token was invalid/expired anyway — nothing to revoke
      }
      return res.status(403).json({
        message: "Security compromise detected. Please log in again.",
      });
    }

    // Verify the token signature and expiry (synchronous form, wrapped in try/catch
    // so a verification failure never becomes an unhandled rejection)
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (foundUser._id.toString() !== decoded.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // --- Rotation ---
    const newAccessToken = generateAccessToken(foundUser);
    const newRefreshToken = generateRefreshToken(foundUser);

    // Atomic update: pull the old token and push the new one in ONE operation.
    // updateOne() bypasses Mongoose's document versioning, so two concurrent
    // requests can't collide the way find() + save() did.
    const updateResult = await User.updateOne(
      { _id: foundUser._id, "refreshTokens.token": refreshToken },
      {
        $pull: { refreshTokens: { token: refreshToken } },
      },
    );

    // If nothing was pulled, another concurrent request already rotated this
    // exact token — treat it as a reuse attempt rather than crashing.
    if (updateResult.modifiedCount === 0) {
      return res.status(403).json({
        message: "Security compromise detected. Please log in again.",
      });
    }

    await User.updateOne(
      { _id: foundUser._id },
      { $push: { refreshTokens: { token: newRefreshToken } } },
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/auth/logout
export const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.sendStatus(204); // No content, nothing to log out
  }

  // Remove this specific refresh token from the user's token list
  await User.updateOne(
    { "refreshTokens.token": refreshToken },
    { $pull: { refreshTokens: { token: refreshToken } } },
  );

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.sendStatus(204);
};

// @route GET /api/v1/auth/me
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
