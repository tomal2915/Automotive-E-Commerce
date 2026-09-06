import Category from "../models/Category.js";

// @route GET /api/v1/categories
// Returns top-level categories, each with its subcategories nested in
export const getCategories = async (req, res) => {
  try {
    const allCategories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    const topLevel = allCategories.filter((c) => !c.parentCategory);
    const withChildren = topLevel.map((parent) => ({
      ...parent,
      subcategories: allCategories.filter(
        (c) => c.parentCategory?.toString() === parent._id.toString(),
      ),
    }));

    res.json({ categories: withChildren });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/categories (admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description, hasVehicleAttributes, parentCategory } =
      req.body;
    const slug = `${name}-${parentCategory || "root"}`
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const category = await Category.create({
      name,
      slug,
      description,
      hasVehicleAttributes: !!hasVehicleAttributes,
      parentCategory: parentCategory || null,
      image: req.file?.path || "",
    });

    res.status(201).json({ category });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({
          message:
            "A category with this name already exists under the selected parent",
        });
    }
    res
      .status(400)
      .json({ message: "Invalid category data", error: error.message });
  }
};

// @route PUT /api/v1/categories/:id (admin only)
export const updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = req.file.path;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json({ category });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid update data", error: error.message });
  }
};

// @route DELETE /api/v1/categories/:id (admin only)
export const deleteCategory = async (req, res) => {
  try {
    // Soft-delete (deactivate) instead of hard delete — existing products
    // still reference this category name by string, so removing it
    // outright would orphan them with a "ghost" category
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deactivated" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
