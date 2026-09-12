import Brand from "../models/Brand.js";
import Product from "../models/Product.js";

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

// @route GET /api/v1/brands (permission: brand:read)
export const getBrands = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) filter.name = new RegExp(search, "i");
    if (status) filter.status = status;

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit), 100);

    const [brands, total] = await Promise.all([
      Brand.find(filter)
        .populate("logo", "url thumbnailUrl")
        .sort({ name: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Brand.countDocuments(filter),
    ]);

    res.json({
      brands,
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

// @route POST /api/v1/brands (permission: brand:create)
export const createBrand = async (req, res) => {
  try {
    const { name, description, status, logo } = req.body;
    const brand = await Brand.create({
      name,
      slug: slugify(name),
      description,
      status,
      logo: logo || null,
    });
    res.status(201).json({ brand });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ message: "A brand with this name already exists" });
    res
      .status(400)
      .json({ message: "Invalid brand data", error: error.message });
  }
};

// @route PUT /api/v1/brands/:id (permission: brand:update)
export const updateBrand = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.name) updateData.slug = slugify(updateData.name);

    const brand = await Brand.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.json({ brand });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ message: "A brand with this name already exists" });
    res
      .status(400)
      .json({ message: "Invalid update data", error: error.message });
  }
};

// @route DELETE /api/v1/brands/:id (permission: brand:delete)
export const deleteBrand = async (req, res) => {
  try {
    const productCount = await Product.countDocuments({ brand: req.params.id });
    if (productCount > 0) {
      return res
        .status(409)
        .json({
          message: `Cannot delete — ${productCount} product(s) still reference this brand.`,
        });
    }

    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.json({ message: "Brand deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
