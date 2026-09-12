import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    // Normalized to lowercase, e.g. "product:create" — enforced here so
    // "Product:Create" and "product:create" never both exist
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    module: { type: String, required: true, lowercase: true, trim: true }, // e.g. "product"
    action: { type: String, required: true, lowercase: true, trim: true }, // e.g. "create"
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("Permission", permissionSchema);
