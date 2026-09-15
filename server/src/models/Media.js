import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    url: { type: String, required: true }, // Cloudinary secure_url
    thumbnailUrl: { type: String }, // Cloudinary-generated smaller version
    mimeType: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "other"], required: true },
    size: { type: Number, required: true }, // bytes
    width: { type: Number },
    height: { type: Number },
    altText: { type: String, default: "" },
    title: { type: String, default: "" },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Tracks which documents currently reference this asset — lets us
    // refuse deletion while still attached, and lets the admin UI show
    // "used in 3 products" instead of guessing
    usageCount: { type: Number, default: 0 },

    // null = "Uncategorized" / root-level file
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaFolder",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

// Supports the common query pattern: filter by folder + type together
// (e.g. "images inside folder X") — this compound index also serves
// folder-only queries since folder is the index's leading field
mediaSchema.index({ folder: 1, type: 1 });

export default mongoose.model("Media", mediaSchema);
