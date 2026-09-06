import "dotenv/config";
import mongoose from "mongoose";
import Category from "../src/models/Category.js";

const categories = [
  {
    name: "Automotive",
    slug: "automotive",
    hasVehicleAttributes: true,
    description: "Auto parts and accessories",
  },
  {
    name: "Electronics",
    slug: "electronics",
    hasVehicleAttributes: false,
    description: "Gadgets, devices, and accessories",
  },
  {
    name: "Clothing",
    slug: "clothing",
    hasVehicleAttributes: false,
    description: "Apparel and fashion",
  },
  {
    name: "Books",
    slug: "books",
    hasVehicleAttributes: false,
    description: "Books and stationery",
  },
  {
    name: "Home & Living",
    slug: "home-living",
    hasVehicleAttributes: false,
    description: "Home decor and essentials",
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const cat of categories) {
    await Category.updateOne({ slug: cat.slug }, cat, { upsert: true });
  }

  console.log("Categories seeded successfully");
  await mongoose.disconnect();
  process.exit(0);
};

seed();
