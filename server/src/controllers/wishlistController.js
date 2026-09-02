import Wishlist from "../models/Wishlist.js";

// @route GET /api/v1/wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
      "products",
      "title price images stock make model yearRange",
    );

    if (!wishlist) {
      return res.json({ wishlist: { products: [] } });
    }

    res.json({ wishlist });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/wishlist/:productId
// Toggles a product in the wishlist — adds it if absent, no-ops if already present
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [productId],
      });
    } else if (!wishlist.products.some((p) => p.toString() === productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    const populated = await wishlist.populate(
      "products",
      "title price images stock make model yearRange",
    );
    res.status(201).json({ wishlist: populated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route DELETE /api/v1/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { products: req.params.productId } },
      { new: true },
    ).populate("products", "title price images stock make model yearRange");

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    res.json({ wishlist });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
