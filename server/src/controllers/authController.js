import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import { validatePasswordStrength } from "../utils/passwordValidator.js";
import crypto from "crypto";
import { transporter } from "../config/mailer.js";

// @route POST /api/v1/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({
        message: passwordCheck.errors[0],
        errors: passwordCheck.errors,
      });
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
        avatar: user.avatar, // ADDED
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
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        );
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
        avatar: user.avatar, // ADDED
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // IMPORTANT: always return the same success message whether or not
    // the email exists — revealing "email not found" lets an attacker
    // enumerate which emails have accounts on this site
    const genericResponse = {
      message:
        "If an account exists with that email, a reset link has been sent.",
    };

    if (!user) {
      return res.json(genericResponse);
    }

    // Generate a random token, store only its HASH in the DB (never the
    // raw token) — same principle as password hashing: if the DB is ever
    // leaked, the raw tokens (which grant account access) aren't exposed
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to choose a new one — this link expires in 30 minutes.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #38bdf8; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          <p style="color: #64748b; margin-top: 16px; font-size: 13px;">If you didn't request this, you can safely ignore this email — your password will remain unchanged.</p>
        </div>
      `,
    });

    res.json(genericResponse);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.isValid) {
      return res
        .status(400)
        .json({
          message: passwordCheck.errors[0],
          errors: passwordCheck.errors,
        });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // must not be expired
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res
        .status(400)
        .json({ message: "This reset link is invalid or has expired" });
    }

    user.password = newPassword; // pre-save hook re-hashes automatically
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Invalidate all existing sessions — same reasoning as changePassword:
    // if someone reset the password (possibly an attacker who got access
    // to the email), old sessions everywhere should die
    user.refreshTokens = [];
    await user.save();

    res.json({
      message:
        "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
