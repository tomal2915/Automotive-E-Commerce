import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { validatePasswordStrength } from "../utils/passwordValidator.js";

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
      return res
        .status(400)
        .json({
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
