import "dotenv/config";
import mongoose from "mongoose";
import Permission from "../src/models/Permission.js";
import Role from "../src/models/Role.js";
import User from "../src/models/User.js";

const MODULES = {
  dashboard: ["watch"],
  permission: ["watch", "create", "read", "update", "delete"],
  role: ["watch", "create", "read", "update", "delete"],
  user: ["watch", "create", "read", "update", "delete"],
  media: ["watch", "read", "upload", "write", "delete"],
  category: ["watch", "create", "read", "update", "delete"],
  brand: ["watch", "create", "read", "update", "delete"],
  attribute: ["watch", "create", "read", "update", "delete"],
  product: ["watch", "create", "read", "update", "delete"],
  order: ["watch", "read", "update"],
  coupon: ["watch", "create", "read", "update", "delete"],
  testimonial: ["watch", "create", "update", "delete"],
};

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // 1. Create every permission
  const allPermissions = [];
  for (const [module, actions] of Object.entries(MODULES)) {
    for (const action of actions) {
      const name = `${module}:${action}`;
      const permission = await Permission.findOneAndUpdate(
        { name },
        { name, module, action },
        { upsert: true, returnDocument: "after" },
      );
      allPermissions.push(permission);
    }
  }
  console.log(`Seeded ${allPermissions.length} permissions`);

  // 2. Super Admin role — holds everything
  const superAdminRole = await Role.findOneAndUpdate(
    { name: "Super Admin" },
    {
      name: "Super Admin",
      description: "Full system access",
      permissions: allPermissions.map((p) => p._id),
    },
    { upsert: true, returnDocument: "after" },
  );

  // 3. Limited "Catalog Manager" role — catalog access only, as required
  // by the assignment for testing 403 behavior
  const catalogPermissions = allPermissions.filter((p) =>
    ["category", "brand", "attribute", "product", "media"].includes(p.module),
  );
  const catalogRole = await Role.findOneAndUpdate(
    { name: "Catalog Manager" },
    {
      name: "Catalog Manager",
      description: "Catalog access only — no permission/role/user access",
      permissions: catalogPermissions.map((p) => p._id),
    },
    { upsert: true, returnDocument: "after" },
  );

  console.log("Seeded Super Admin and Catalog Manager roles");

  // 4. Seed users
  const existingSuperAdmin = await User.findOne({
    email: "superadmin@shop.example.com",
  });
  if (!existingSuperAdmin) {
    await User.create({
      name: "Super Admin",
      email: "superadmin@shop.example.com",
      password: "SuperAdmin@2026!", // pre-save hook hashes this automatically
      role: superAdminRole._id,
      isEmailVerified: true,
    });
    console.log(
      "Created Super Admin user: superadmin@shop.example.com / SuperAdmin@2026!",
    );
  }

  const existingLimitedUser = await User.findOne({
    email: "catalogmanager@shop.example.com",
  });
  if (!existingLimitedUser) {
    await User.create({
      name: "Catalog Manager",
      email: "catalogmanager@shop.example.com",
      password: "Catalog@2026!",
      role: catalogRole._id,
      isEmailVerified: true,
    });
    console.log(
      "Created limited test user: catalogmanager@shop.example.com / Catalog@2026!",
    );
  }

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("RBAC seed failed:", err);
  process.exit(1);
});
