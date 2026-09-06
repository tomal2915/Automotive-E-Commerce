import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    hasVehicleAttributes: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Self-referencing — null/undefined means this IS a top-level
    // category. A category with parentCategory set is a subcategory
    // (e.g. "Men" -> parent "Clothing").
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  { timestamps: true },
);

// name is unique only WITHIN a parent — "Men" can exist under both
// "Clothing" and, say, a future "Accessories" category without clashing
categorySchema.index({ name: 1, parentCategory: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
