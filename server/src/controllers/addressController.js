import Address from "../models/Address.js";

// @route GET /api/v1/addresses
export const getAddresses = async (req, res) => {
  try {
    // Default address first, then most recently added
    const addresses = await Address.find({ user: req.user.id }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    res.json({ addresses });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/addresses
export const createAddress = async (req, res) => {
  try {
    const { label, name, phone, street, city, postcode, isDefault } = req.body;

    // If this is the user's very first address, force it to be default
    // regardless of what was sent — there should always be exactly one
    // default once at least one address exists
    const existingCount = await Address.countDocuments({ user: req.user.id });
    const shouldBeDefault = existingCount === 0 || isDefault === true;

    if (shouldBeDefault) {
      // Unset any previous default before setting this new one, so only
      // one address is ever marked default at a time
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user.id,
      label,
      name,
      phone,
      street,
      city,
      postcode,
      isDefault: shouldBeDefault,
    });

    res.status(201).json({ address });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid address data", error: error.message });
  }
};

// @route PUT /api/v1/addresses/:id
export const updateAddress = async (req, res) => {
  try {
    const { label, name, phone, street, city, postcode, isDefault } = req.body;

    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (isDefault === true && !address.isDefault) {
      // Making this one default — unset the previous default first
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    if (label !== undefined) address.label = label;
    if (name !== undefined) address.name = name;
    if (phone !== undefined) address.phone = phone;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (postcode !== undefined) address.postcode = postcode;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();
    res.json({ address });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid address data", error: error.message });
  }
};

// @route DELETE /api/v1/addresses/:id
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If the deleted address was the default one, promote the most
    // recently added remaining address to default — the user should
    // never be left with zero default addresses while having any at all
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ user: req.user.id }).sort({
        createdAt: -1,
      });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({ message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
