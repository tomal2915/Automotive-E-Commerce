import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: { type: String, default: "" },
    image: { type: String, default: "" },

    // If true, the frontend shows the automotive-specific fields
    // (make/model/year) on the product form and the vehicle filter bar.
    // Every other category just uses generic specifications instead.
    hasVehicleAttributes: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Category", categorySchema);
