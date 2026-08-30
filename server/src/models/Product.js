import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: "text" },
    description: { type: String, required: true },
    partNumber: { type: String, required: true, unique: true, index: true },

    // Vehicle compatibility fields
    make: { type: String, required: true, index: true }, // e.g. BMW, Audi, Toyota
    model: { type: String, required: true, index: true }, // e.g. M3, A4, Camry
    yearRange: {
      start: { type: Number, required: true },
      end: { type: Number, required: true },
    },

    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, index: true },
    stock: { type: Number, default: 0, min: 0 },

    images: [{ type: String }], // image URLs, will wire up upload later

    specifications: { type: Map, of: String }, // e.g. { "Material": "Ceramic" }
  },
  { timestamps: true },
);

// Compound index for fast automotive search filtering
// (matches the common filter combination: make + model + category + price)
productSchema.index({ make: 1, model: 1, category: 1, price: 1 });

export default mongoose.model("Product", productSchema);
