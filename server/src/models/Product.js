import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    attributeValues: [
      {
        attribute: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
          required: true,
        },
        value: { type: mongoose.Schema.Types.ObjectId, required: true }, // subdocument _id inside Attribute.values
        // Denormalized labels so we don't have to populate+lookup on
        // every read just to show "Red / XL" in a table
        attributeName: { type: String, required: true },
        valueLabel: { type: String, required: true },
      },
    ],
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    stockStatus: {
      type: String,
      enum: ["in_stock", "out_of_stock", "low_stock"],
      default: "in_stock",
    },
    lowStockThreshold: { type: Number, default: 5 },
    weight: { type: Number },
    isActive: { type: Boolean, default: true },
    media: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],
  },
  { _id: true },
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: "text" },
    slug: { type: String, unique: true, sparse: true, lowercase: true },
    description: { type: String, required: true },
    sku: { type: String, unique: true, sparse: true, index: true }, // required only for simple products — see pre-validate hook below

    category: { type: String, required: true, index: true },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
    },

    make: { type: String, index: true },
    model: { type: String, index: true },
    yearRange: { start: { type: Number }, end: { type: Number } },

    // The simple/variable split that governs which fields are meaningful
    hasVariants: { type: Boolean, default: false },

    // Simple-product fields — only used when hasVariants is false
    price: { type: Number, min: 0 },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    stockStatus: {
      type: String,
      enum: ["in_stock", "out_of_stock", "low_stock"],
      default: "in_stock",
    },

    variants: [variantSchema], // only used when hasVariants is true

    images: [{ type: String }], // legacy plain-URL images, kept for backward compatibility
    mediaRefs: [
      {
        media: { type: mongoose.Schema.Types.ObjectId, ref: "Media" },
        isThumbnail: { type: Boolean, default: false },
        isGallery: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
      },
    ],

    specifications: { type: Map, of: String },

    weight: { type: Number },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },

    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Enforces the "simple XOR variable" rule at the database-validation
// layer, not just in controller logic — a price on a variable product,
// or a missing price on a simple one, is rejected before it can save
productSchema.pre("validate", function () {
  if (this.hasVariants) {
    if (this.price !== undefined || this.salePrice !== undefined) {
      throw new Error(
        "A variable product must not set price/salePrice directly — set them per-variant.",
      );
    }
    if (!this.variants || this.variants.length === 0) {
      throw new Error("A variable product must have at least one variant.");
    }
  } else {
    if (this.price === undefined) {
      throw new Error("A simple product requires a price.");
    }
    if (this.salePrice !== undefined && this.salePrice > this.price) {
      throw new Error("Sale price cannot exceed the regular price.");
    }
  }
});

productSchema.index({ make: 1, model: 1, category: 1, price: 1 });

export default mongoose.model("Product", productSchema);
