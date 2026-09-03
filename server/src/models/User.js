import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Profile fields
    phone: { type: String, trim: true, default: "" },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      postcode: { type: String, default: "" },
    },
    avatar: { type: String, default: "" }, // Cloudinary URL

    refreshTokens: [
      {
        token: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Password reset fields — token is hashed before storing (never store
    // the raw token, same principle as never storing raw passwords)
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    twoFactorBackupCodes: { type: [String], select: false, default: [] }, // hashed, one-time-use recovery codes

    registrationDeviceId: { type: String, index: true, select: false },

    failedLoginAttempts: { type: Number, default: 0, select: false },
    accountLockedUntil: { type: Date, default: null, select: false },
  },
  { timestamps: true },
);

// Hash password before saving, only if password field was modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
