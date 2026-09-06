import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: "text" },
    description: { type: String, required: true },
    sku: { type: String, required: true, unique: true, index: true }, // renamed from partNumber — generic "Stock Keeping Unit"

    category: { type: String, required: true, index: true },

    // Automotive-specific — now OPTIONAL, only populated when category
    // has vehicle attributes (e.g. "Automotive"). Left empty/undefined
    // for every other category (Electronics, Clothing, Books, etc.)
    make: { type: String, index: true },
    model: { type: String, index: true },
    yearRange: {
      start: { type: Number },
      end: { type: Number },
    },

    price: { type: Number, required: true, index: true },
    stock: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],

    // Generic key-value attributes for ANY category — e.g. for
    // Electronics: { "Brand": "Samsung", "Warranty": "1 year" }
    // for Clothing: { "Size": "L", "Color": "Blue", "Material": "Cotton" }
    specifications: { type: Map, of: String },

    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Only useful when make/model are actually populated (automotive), but
// harmless (sparse-like behavior) for products where they're empty
productSchema.index({ make: 1, model: 1, category: 1, price: 1 });

export default mongoose.model("Product", productSchema);
