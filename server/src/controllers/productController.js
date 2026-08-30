import Product from "../models/Product.js";

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

// @route POST /api/v1/products (admin only — protected later in Step 11)
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid product data", error: error.message });
  }
};

// @route GET /api/v1/products/filters/options
export const getFilterOptions = async (req, res) => {
  try {
    const { year, make, model } = req.query;

    const filter = {};

    if (year) {
      filter["yearRange.start"] = { $lte: Number(year) };
      filter["yearRange.end"] = { $gte: Number(year) };
    }
    if (make) filter.make = make;
    if (model) filter.model = model;

    const [makes, models, categories] = await Promise.all([
      Product.distinct("make", filter),
      Product.distinct("model", filter),
      Product.distinct("category", {}),
    ]);

    // Generate a reasonable year list (current year down to 25 years back)
    // rather than deriving it from stored data, since a product's yearRange
    // can span many years that wouldn't otherwise show up as a distinct value.
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 26 }, (_, i) => currentYear - i);

    res.json({
      years,
      makes: makes.sort(),
      models: models.sort(),
      categories: categories.sort(),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route PUT /api/v1/products/:id (admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the updated document
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid update data", error: error.message });
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
