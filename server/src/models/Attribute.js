import mongoose from "mongoose";

const attributeValueSchema = new mongoose.Schema({
  value: { type: String, required: true },
  slug: { type: String, required: true },
  referenceValue: { type: String, default: "" }, // hex code for color, or a Media ObjectId string for image-swatch
});

const attributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // e.g. "Color", "Size"
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: {
      type: String,
      enum: ["dropdown", "radio", "checkbox", "color", "image"],
      default: "dropdown",
    },
    values: [attributeValueSchema],
  },
  { timestamps: true },
);

// A value must be unique WITHIN its attribute (e.g. "Red" once under
// Color), but the same word can exist under a different attribute
attributeSchema.index({ "values.slug": 1, _id: 1 });

export default mongoose.model("Attribute", attributeSchema);
