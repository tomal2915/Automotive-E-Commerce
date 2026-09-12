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
  },
  { timestamps: true },
);

export default mongoose.model("Media", mediaSchema);
