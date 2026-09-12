import mongoose from "mongoose";

const mediaFolderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaFolder",
      default: null, // null = root-level folder
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Name unique only among siblings (same parent) — "Logos" can exist
// under both "Brand" and "Category" without clashing, same principle
// as Category's name+parentCategory index
mediaFolderSchema.index({ name: 1, parentFolder: 1 }, { unique: true });

export default mongoose.model("MediaFolder", mediaFolderSchema);
