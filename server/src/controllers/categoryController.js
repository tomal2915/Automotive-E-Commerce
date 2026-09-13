import Category from "../models/Category.js";

// Recursively nests categories under their parent, to unlimited depth —
// e.g. Electronics -> Phone -> Touch / Non-Touch, Electronics -> Headphones
const buildCategoryTree = (categories, parentId = null) =>
  categories
    .filter((c) =>
      parentId
        ? c.parentCategory?.toString() === parentId.toString()
        : !c.parentCategory,
    )
    .map((c) => ({
      ...c,
      subcategories: buildCategoryTree(categories, c._id),
    }));

// Correctly interprets the string "true"/"false" that always arrives from
// FormData — a naive !!value is WRONG here, since any non-empty string
// (including the literal text "false") is truthy in JavaScript.
const parseBoolean = (value) => value === true || value === "true";

// @route GET /api/v1/categories
// Returns top-level categories, each with its subcategories nested in
export const getCategories = async (req, res) => {
  try {
    const allCategories = await Category.find({
      isActive: true,
      // Guard against any un-migrated legacy string image values —
      // populate() throws a CastError on those, which would otherwise
      // 500 the entire endpoint for every category, not just the bad one
      $or: [{ image: null }, { image: { $type: "objectId" } }],
    })
      .sort({ name: 1 })
      .populate("image")
      .lean();

    res.json({ categories: buildCategoryTree(allCategories) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/categories (admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description, hasVehicleAttributes, parentCategory, image } =
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
      hasVehicleAttributes: parseBoolean(hasVehicleAttributes),
      parentCategory:
        parentCategory && parentCategory.trim() !== "" ? parentCategory : null,
      image: image || null, // Media _id selected via MediaPicker
    });

    res.status(201).json({ category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A category with this name already exists under the selected parent",
      });
    }
    res
      .status(400)
      .json({ message: "Invalid category data", error: error.message });
  }
};

// Recursively collects every descendant id of a category — used to stop
// a category from being re-parented under its own descendant, which
// would create a circular reference and break tree building
const getDescendantIds = async (categoryId) => {
  const children = await Category.find({ parentCategory: categoryId }).select(
    "_id",
  );
  const childIds = children.map((c) => c._id.toString());
  const nestedIds = await Promise.all(childIds.map(getDescendantIds));
  return [...childIds, ...nestedIds.flat()];
};

// @route PUT /api/v1/categories/:id (admin only)
// @route PUT /api/v1/categories/:id (admin only)
export const updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if ("hasVehicleAttributes" in updateData) {
      updateData.hasVehicleAttributes = parseBoolean(
        updateData.hasVehicleAttributes,
      );
    }

    if ("parentCategory" in updateData) {
      updateData.parentCategory =
        updateData.parentCategory && updateData.parentCategory.trim() !== ""
          ? updateData.parentCategory
          : null;
    }

    if (updateData.parentCategory) {
      if (updateData.parentCategory === req.params.id) {
        return res
          .status(400)
          .json({ message: "A category cannot be its own parent" });
      }
      const descendantIds = await getDescendantIds(req.params.id);
      if (descendantIds.includes(updateData.parentCategory)) {
        return res.status(400).json({
          message:
            "Cannot set a subcategory as the parent — this would create a circular reference",
        });
      }
    }

    // New file always wins. Otherwise, an explicit removeImage flag clears
    // the existing image. Without either, the image is left untouched.
    if (parseBoolean(updateData.removeImage)) {
      updateData.image = null;
    } else if (!updateData.image) {
      delete updateData.image; // no change requested — keep existing reference
    }
    // otherwise updateData.image is a Media _id string from MediaPicker,
    // passed through as-is
    delete updateData.removeImage; // never persist this — it's a signal, not a schema field

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after", runValidators: true },
    ).populate("image");

    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json({ category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A category with this name already exists under the selected parent",
      });
    }
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
      { returnDocument: "after" },
    );
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deactivated" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
