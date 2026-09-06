import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "Verified Buyer", trim: true },
    quote: { type: String, required: true, trim: true, maxlength: 500 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    avatar: { type: String, default: "" }, // optional Cloudinary URL, falls back to initial-letter avatar
    isActive: { type: Boolean, default: true }, // lets admin hide a testimonial without deleting it
    displayOrder: { type: Number, default: 0 }, // lower numbers show first
  },
  { timestamps: true },
);

export default mongoose.model("Testimonial", testimonialSchema);
