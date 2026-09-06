import Testimonial from "../models/Testimonial.js";

// @route GET /api/v1/testimonials
// Public — only active testimonials, in admin-defined order
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({
      displayOrder: 1,
      createdAt: -1,
    });
    res.json({ testimonials });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/testimonials/admin/all (admin only) — includes inactive ones
export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({
      displayOrder: 1,
      createdAt: -1,
    });
    res.json({ testimonials });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/testimonials (admin only)
export const createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create({
      ...req.body,
      avatar: req.file?.path || "",
    });
    res.status(201).json({ testimonial });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid testimonial data", error: error.message });
  }
};

// @route PUT /api/v1/testimonials/:id (admin only)
export const updateTestimonial = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.avatar = req.file.path;

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!testimonial)
      return res.status(404).json({ message: "Testimonial not found" });
    res.json({ testimonial });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid update data", error: error.message });
  }
};

// @route DELETE /api/v1/testimonials/:id (admin only)
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial)
      return res.status(404).json({ message: "Testimonial not found" });
    res.json({ message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
