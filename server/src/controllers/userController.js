import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { validatePasswordStrength } from "../utils/passwordValidator.js";

import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";
import Address from "../models/Address.js";

// @route GET /api/v1/users/profile
// Returns the full profile of the logged-in user
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route PUT /api/v1/users/profile
// Updates non-sensitive profile fields (never email/password/role here)
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, street, city, postcode } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    // Only touch address fields that were actually sent
    if (street !== undefined || city !== undefined || postcode !== undefined) {
      const currentUser = await User.findById(req.user.id);
      updateData.address = {
        street:
          street !== undefined ? street : (currentUser.address?.street ?? ""),
        city: city !== undefined ? city : (currentUser.address?.city ?? ""),
        postcode:
          postcode !== undefined
            ? postcode
            : (currentUser.address?.postcode ?? ""),
      };
    }

    // A new avatar file was uploaded in this request
    if (req.file) {
      updateData.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid profile data", error: error.message });
  }
};

// @route PUT /api/v1/users/change-password
// Separate from updateProfile on purpose — password changes need extra
// verification (current password) and shouldn't be bundled with casual edits
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.isValid) {
      return res.status(400).json({
        message: passwordCheck.errors[0],
        errors: passwordCheck.errors,
      });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Assigning triggers the pre-save hook, which re-hashes automatically
    user.password = newPassword;

    // Changing the password invalidates all existing sessions on other
    // devices — force re-login everywhere for security
    user.refreshTokens = [];
    await user.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.json({
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/users/admin/all (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email role isEmailVerified createdAt")
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route DELETE /api/v1/users/admin/:id (admin only)
export const deleteUser = async (req, res) => {
  try {
    // Prevent an admin from deleting their own account through this
    // endpoint — a self-lockout (or accidental self-deletion) should
    // never be possible via a simple click
    if (req.params.id === req.user.id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Clean up data that belongs solely to this user — otherwise these
    // become orphaned documents referencing a deleted user forever.
    // Orders are intentionally NOT deleted — they're financial/audit
    // records and should persist even after the user account is gone.
    await Promise.all([
      Cart.deleteOne({ user: user._id }),
      Wishlist.deleteOne({ user: user._id }),
      Address.deleteMany({ user: user._id }),
    ]);

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route PUT /api/v1/users/admin/:id/role (admin only)
// Promotes a user to admin, or demotes an admin back to a regular user
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Prevent an admin from demoting themselves — same self-lockout
    // concern as deletion. If they need to step down, another admin
    // should do it.
    if (req.params.id === req.user.id) {
      return res
        .status(400)
        .json({ message: "You cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("name email role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user,
      message: `${user.name} is now ${role === "admin" ? "an admin" : "a regular user"}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
