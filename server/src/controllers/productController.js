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

// @route POST /api/v1/products (admin only)
export const createProduct = async (req, res) => {
  try {
    // Multer + CloudinaryStorage populate req.files with the uploaded images,
    // each already containing the Cloudinary-hosted URL in `.path`
    const imageUrls = (req.files || []).map((file) => file.path);

    const productData = {
      ...req.body,
      images: imageUrls,
      // yearRange arrives as separate form fields since this is multipart/form-data,
      // not JSON, so we reconstruct the nested object here
      yearRange: {
        start: Number(req.body.yearRangeStart),
        end: Number(req.body.yearRangeEnd),
      },
    };

    const product = await Product.create(productData);
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
    const updateData = { ...req.body };

    // Only overwrite images if new ones were uploaded in this request
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.path);
    }

    if (req.body.yearRangeStart && req.body.yearRangeEnd) {
      updateData.yearRange = {
        start: Number(req.body.yearRangeStart),
        end: Number(req.body.yearRangeEnd),
      };
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
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
      $or: [{ title: searchRegex }, { make: searchRegex }, { model: searchRegex }],
    })
      .select("title make model category price images")
      .limit(8) // keep the dropdown short and the query cheap
      .lean(); // plain JS objects — faster since we don't need Mongoose document methods here

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

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const related = await Product.find({
      _id: { $ne: product._id }, // exclude the product itself
      $or: [
        { category: product.category },
        { make: product.make, model: product.model },
      ],
    })
      .select("title price images make model category averageRating reviewCount yearRange stock")
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
      .select("title price images make model category averageRating reviewCount yearRange stock")
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