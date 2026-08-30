import Product from "../models/Product.js";

// @route GET /api/v1/products
// Supports dynamic filtering + pagination for the automotive catalog
export const getProducts = async (req, res) => {
  try {
    const {
      make,
      model,
      category,
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
    const limitNum = Math.min(Number(limit), 100); // cap to prevent abuse
    const skip = (pageNum - 1) * limitNum;

    // Run the count and the actual query in parallel for speed
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

// @route POST /api/v1/products (admin only — protected later in Step 11)
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (error) {
    res.status(400).json({ message: "Invalid product data", error: error.message });
  }
};

// @route GET /api/v1/products/filters/options
// Returns distinct values so the frontend can build filter dropdowns
export const getFilterOptions = async (req, res) => {
  try {
    const [makes, categories] = await Promise.all([
      Product.distinct("make"),
      Product.distinct("category"),
    ]);

    res.json({ makes, categories });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};