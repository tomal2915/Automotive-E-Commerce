import "dotenv/config";
import mongoose from "mongoose";

const migrate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const collection = db.collection("products");

  // Drop the old unique index on partNumber BEFORE renaming the field —
  // otherwise multiple documents ending up with partNumber: null
  // (after $unset) collide against that old unique constraint.
  try {
    await collection.dropIndex("partNumber_1");
    console.log("Dropped old partNumber_1 index");
  } catch (error) {
    // Index might not exist (already dropped, or named differently) —
    // that's fine, just log it and continue
    console.log(
      "Could not drop partNumber_1 index (may not exist):",
      error.message,
    );
  }

  const result = await collection.updateMany(
    { partNumber: { $exists: true }, sku: { $exists: false } },
    [{ $set: { sku: "$partNumber" } }, { $unset: "partNumber" }],
  );

  console.log(
    `Migrated ${result.modifiedCount} products from partNumber to sku`,
  );

  // Ensure the new sku index exists (Mongoose will normally create this
  // automatically on next app startup from the schema, but creating it
  // explicitly here confirms it works against the migrated data)
  await collection.createIndex({ sku: 1 }, { unique: true });
  console.log("Created sku unique index");

  await mongoose.disconnect();
  process.exit(0);
};

migrate().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
