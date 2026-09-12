import mongoose from "mongoose";
import Product from "../models/Product.js";
import { generateVariantCombinations } from "../utils/variantGenerator.js";

export const getProducts = async (req, res) => {
  try {
    const {
      make,
      model,
      category,
      year,
      minPrice,
      maxPrice,
      inStock,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (make) filter.make = make;
    if (model) filter.model = model;
    if (category) filter.category = category;

    // A product matches a year if the year falls within its yearRange
    if (year) {
      filter["yearRange.start"] = { $lte: Number(year) };
      filter["yearRange.end"] = { $gte: Number(year) };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (inStock === "true") {
      filter.stock = { $gt: 0 };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/products (admin only)
export const createProduct = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let createdProduct;

    // Wrapped in a transaction: if variant validation fails partway
    // through, no half-built product survives — atomic all-or-nothing
    await session.withTransaction(async () => {
      const imageUrls = (req.files || []).map((file) => file.path);
      const hasVariants =
        req.body.hasVariants === "true" || req.body.hasVariants === true;

      const baseData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        brand: req.body.brand || null,
        images: imageUrls,
        hasVariants,
      };

      if (req.body.make) baseData.make = req.body.make;
      if (req.body.model) baseData.model = req.body.model;
      if (req.body.yearRangeStart && req.body.yearRangeEnd) {
        baseData.yearRange = {
          start: Number(req.body.yearRangeStart),
          end: Number(req.body.yearRangeEnd),
        };
      }
      if (req.body.specifications)
        baseData.specifications = JSON.parse(req.body.specifications);

      if (hasVariants) {
        const variantsInput = JSON.parse(req.body.variants || "[]");

        // Reject duplicate SKUs within this submission before it ever
        // touches the database
        const skus = variantsInput.map((v) => v.sku);
        if (new Set(skus).size !== skus.length) {
          throw new Error("Duplicate SKU found among the submitted variants");
        }

        // Reject two variants with the identical attribute-value combination
        const comboKeys = variantsInput.map((v) =>
          v.attributeValues
            .map((av) => `${av.attribute}:${av.value}`)
            .sort()
            .join("|"),
        );
        if (new Set(comboKeys).size !== comboKeys.length) {
          throw new Error("Duplicate variant attribute combination found");
        }

        baseData.variants = variantsInput;
        baseData.sku = undefined;
      } else {
        baseData.sku = req.body.sku;
        baseData.price = Number(req.body.price);
        if (req.body.salePrice) baseData.salePrice = Number(req.body.salePrice);
        baseData.stock = Number(req.body.stock);
      }

      const [product] = await Product.create([baseData], { session });
      createdProduct = product;
    });

    res.status(201).json({ product: createdProduct });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Duplicate SKU or slug", error: error.message });
    }
    res.status(400).json({ message: error.message || "Invalid product data" });
  } finally {
    await session.endSession();
  }
};

// @route POST /api/v1/products/generate-variants
// Helper endpoint the frontend calls after the admin picks attributes/values —
// returns every combination for the admin to review before saving
export const previewVariantCombinations = async (req, res) => {
  try {
    const { attributeSelections } = req.body; // [{ attributeId, attributeName, values: [{valueId, valueLabel}] }]
    const combinations = generateVariantCombinations(attributeSelections);
    res.json({ combinations });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid attribute selection", error: error.message });
  }
};

// @route GET /api/v1/products/filters/options
export const getFilterOptions = async (req, res) => {
  try {
    const { year, make, model, category } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (year) {
      filter["yearRange.start"] = { $lte: Number(year) };
      filter["yearRange.end"] = { $gte: Number(year) };
    }
    if (make) filter.make = make;
    if (model) filter.model = model;

    const [makes, models] = await Promise.all([
      Product.distinct("make", { ...filter, make: { $nin: [null, ""] } }),
      Product.distinct("model", { ...filter, model: { $nin: [null, ""] } }),
    ]);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 26 }, (_, i) => currentYear - i);

    res.json({
      years,
      makes: makes.filter(Boolean).sort(),
      models: models.filter(Boolean).sort(),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route PUT /api/v1/products/:id (admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.body.title !== undefined) product.title = req.body.title;
    if (req.body.description !== undefined)
      product.description = req.body.description;
    if (req.body.category !== undefined) product.category = req.body.category;
    if (req.body.brand !== undefined) product.brand = req.body.brand || null;

    if (req.body.make !== undefined) product.make = req.body.make;
    if (req.body.model !== undefined) product.model = req.body.model;
    if (req.body.yearRangeStart && req.body.yearRangeEnd) {
      product.yearRange = {
        start: Number(req.body.yearRangeStart),
        end: Number(req.body.yearRangeEnd),
      };
    }

    if (req.body.specifications) {
      product.specifications = JSON.parse(req.body.specifications);
    }

    const hasVariants =
      req.body.hasVariants === "true" || req.body.hasVariants === true;
    product.hasVariants = hasVariants;

    if (hasVariants) {
      const variantsInput = req.body.variants
        ? JSON.parse(req.body.variants)
        : [];

      const skus = variantsInput.map((v) => v.sku);
      if (new Set(skus).size !== skus.length) {
        return res
          .status(400)
          .json({
            message: "Duplicate SKU found among the submitted variants",
          });
      }

      const comboKeys = variantsInput.map((v) =>
        v.attributeValues
          .map((av) => `${av.attribute}:${av.value}`)
          .sort()
          .join("|"),
      );
      if (new Set(comboKeys).size !== comboKeys.length) {
        return res
          .status(400)
          .json({ message: "Duplicate variant attribute combination found" });
      }

      product.variants = variantsInput;
      product.sku = undefined;
      product.price = undefined;
      product.salePrice = undefined;
      product.stock = undefined;
    } else {
      product.sku = req.body.sku;
      product.price = Number(req.body.price);
      product.salePrice = req.body.salePrice
        ? Number(req.body.salePrice)
        : undefined;
      product.stock = Number(req.body.stock);
      product.variants = [];
    }

    if (req.files && req.files.length > 0) {
      product.images = req.files.map((file) => file.path);
    }

    await product.save();

    res.json({ product });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Duplicate SKU or slug", error: error.message });
    }
    res.status(400).json({ message: error.message || "Invalid update data" });
  }
};

// @route DELETE /api/v1/products/:id (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/products/search/suggestions?q=brake
// Lightweight autocomplete endpoint — returns only what's needed to render
// a dropdown (no full product payload), and caps results tightly.
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    // Case-insensitive prefix/substring match on title, make, and model.
    // Using a regex here (not $text) because autocomplete needs partial-word
    // matching ("bra" -> "Brake") which MongoDB's $text search doesn't do well.
    const searchRegex = new RegExp(q.trim(), "i");

    const suggestions = await Product.find({
      $or: [
        { title: searchRegex },
        { category: searchRegex },
        ...(true ? [{ make: searchRegex }, { model: searchRegex }] : []), // harmless even when empty
      ],
    })
      .select("title make model category price images")
      .limit(8)
      .lean();

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/products/:id/related
// Finds other products that share the same category or make/model —
// helps surface cross-sell opportunities on the product detail page
export const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const orConditions = [{ category: product.category }];

    // Only add the make/model match if this product actually has them
    if (product.make && product.model) {
      orConditions.push({ make: product.make, model: product.model });
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      $or: orConditions,
    })
      .select(
        "title price images make model category averageRating reviewCount yearRange stock",
      )
      .limit(8)
      .lean();

    res.json({ related });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/products/batch?ids=id1,id2,id3
// Fetches multiple products by ID in a single request — used by the
// "Recently Viewed" widget, which only stores IDs in localStorage
export const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.json({ products: [] });
    }

    const idArray = ids.split(",").filter(Boolean).slice(0, 20); // cap to prevent abuse

    const products = await Product.find({ _id: { $in: idArray } })
      .select(
        "title price images make model category averageRating reviewCount yearRange stock",
      )
      .lean();

    // Preserve the original order (most-recently-viewed-first), since
    // $in doesn't guarantee result order matches the input array
    const orderedProducts = idArray
      .map((id) => products.find((p) => p._id.toString() === id))
      .filter(Boolean);

    res.json({ products: orderedProducts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
