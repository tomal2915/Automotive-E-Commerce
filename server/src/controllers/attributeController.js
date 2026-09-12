import Attribute from "../models/Attribute.js";
import Product from "../models/Product.js";

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

// @route GET /api/v1/attributes (permission: attribute:read)
export const getAttributes = async (req, res) => {
  try {
    const attributes = await Attribute.find().sort({ name: 1 });
    res.json({ attributes });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/attributes (permission: attribute:create)
export const createAttribute = async (req, res) => {
  try {
    const { name, type } = req.body;
    const attribute = await Attribute.create({
      name,
      slug: slugify(name),
      type,
      values: [],
    });
    res.status(201).json({ attribute });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ message: "An attribute with this name already exists" });
    res
      .status(400)
      .json({ message: "Invalid attribute data", error: error.message });
  }
};

// @route PUT /api/v1/attributes/:id (permission: attribute:update)
export const updateAttribute = async (req, res) => {
  try {
    const { name, type } = req.body;
    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (type) updateData.type = type;

    const attribute = await Attribute.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" },
    );
    if (!attribute)
      return res.status(404).json({ message: "Attribute not found" });
    res.json({ attribute });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid update data", error: error.message });
  }
};

// @route DELETE /api/v1/attributes/:id (permission: attribute:delete)
export const deleteAttribute = async (req, res) => {
  try {
    // Refuse if any product variant is built on this attribute — deleting
    // it would silently corrupt every variant referencing it
    const inUse = await Product.countDocuments({
      "variants.attributeValues.attribute": req.params.id,
    });
    if (inUse > 0) {
      return res
        .status(409)
        .json({
          message: `This attribute is used by ${inUse} product variant(s) and cannot be deleted.`,
        });
    }

    const attribute = await Attribute.findByIdAndDelete(req.params.id);
    if (!attribute)
      return res.status(404).json({ message: "Attribute not found" });
    res.json({ message: "Attribute deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/attributes/:id/values (permission: attribute:update)
export const addAttributeValue = async (req, res) => {
  try {
    const { value, referenceValue } = req.body;
    const slug = slugify(value);

    const attribute = await Attribute.findById(req.params.id);
    if (!attribute)
      return res.status(404).json({ message: "Attribute not found" });

    if (attribute.values.some((v) => v.slug === slug)) {
      return res
        .status(409)
        .json({ message: `Value "${value}" already exists on this attribute` });
    }

    attribute.values.push({
      value,
      slug,
      referenceValue: referenceValue || "",
    });
    await attribute.save();

    res.status(201).json({ attribute });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid value data", error: error.message });
  }
};

// @route DELETE /api/v1/attributes/:id/values/:valueId (permission: attribute:update)
export const removeAttributeValue = async (req, res) => {
  try {
    const { id, valueId } = req.params;

    // Refuse if a variant already uses this exact value
    const inUse = await Product.countDocuments({
      "variants.attributeValues.value": valueId,
    });
    if (inUse > 0) {
      return res
        .status(409)
        .json({
          message: `This value is used by ${inUse} product variant(s) and cannot be deleted.`,
        });
    }

    const attribute = await Attribute.findByIdAndUpdate(
      id,
      { $pull: { values: { _id: valueId } } },
      { returnDocument: "after" },
    );
    if (!attribute)
      return res.status(404).json({ message: "Attribute not found" });
    res.json({ attribute });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
