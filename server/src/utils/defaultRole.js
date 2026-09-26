import Role from "../models/Role.js";

// Storefront customers who self-register need SOME role (the schema
// requires it), but they shouldn't get any admin permissions. This is
// self-healing on purpose: it creates the "Customer" role on first use
// if it doesn't exist yet, rather than depending on the seed script
// having been run first — this matters for fresh deployments, CI test
// databases, and anyone who forgets to re-run the seed after a reset.
export const getOrCreateCustomerRole = async () => {
  let role = await Role.findOne({ name: "Customer" });

  if (!role) {
    role = await Role.create({
      name: "Customer",
      description:
        "Default role for self-registered storefront customers. Holds no admin permissions — cart/wishlist/order/review routes are gated by login only, not by permission.",
      permissions: [],
    });
  }

  return role;
};
