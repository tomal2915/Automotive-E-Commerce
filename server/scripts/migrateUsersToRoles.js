import "dotenv/config";
import mongoose from "mongoose";
import Role from "../src/models/Role.js";

const migrate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const superAdminRole = await Role.findOne({ name: "Super Admin" });
  const catalogRole = await Role.findOne({ name: "Catalog Manager" });

  if (!superAdminRole || !catalogRole) {
    console.error("Run seedRBAC.js first — roles not found");
    process.exit(1);
  }

  // Old schema had role as the string "admin" or "user" — convert each
  await db
    .collection("users")
    .updateMany({ role: "admin" }, { $set: { role: superAdminRole._id } });
  await db
    .collection("users")
    .updateMany({ role: "user" }, { $set: { role: catalogRole._id } });

  console.log("Migrated existing users to the new Role reference system");
  await mongoose.disconnect();
  process.exit(0);
};

migrate();
