import "dotenv/config";
import mongoose from "mongoose";
import Category from "../src/models/Category.js";
import Product from "../src/models/Product.js";
import Media from "../src/models/Media.js";

const urlToMedia = async (url, uploadedBy) => {
  if (!url) return null;
  const fileName = url.split("/").pop();
  const media = await Media.create({
    fileName,
    url,
    thumbnailUrl: url.replace("/upload/", "/upload/w_200,h_200,c_fill/"),
    mimeType: "image/jpeg", // best guess — legacy records didn't track this
    type: "image",
    size: 0, // unknown for legacy assets
    uploadedBy,
  });
  return media._id;
};

const migrate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const fallbackUser = await mongoose.connection
    .collection("users")
    .findOne({}); // any existing user, just to satisfy the required uploadedBy field
  if (!fallbackUser)
    throw new Error("No users found — cannot attribute migrated media");

  // Categories: image (String) -> image (ObjectId)
  const categories = await Category.find({
    image: { $type: "string", $ne: "" },
  });
  for (const cat of categories) {
    const mediaId = await urlToMedia(cat.image, fallbackUser._id);
    cat.image = mediaId;
    await cat.save({ validateBeforeSave: false }); // schema now expects ObjectId, so skip old-value validation
  }
  console.log(`Migrated ${categories.length} category images`);

  // Products: legacy images[] (String[]) -> mediaRefs[]
  const products = await Product.find({ images: { $exists: true, $ne: [] } });
  for (const prod of products) {
    const mediaRefs = [];
    for (let i = 0; i < prod.images.length; i++) {
      const mediaId = await urlToMedia(prod.images[i], fallbackUser._id);
      mediaRefs.push({
        media: mediaId,
        isThumbnail: i === 0,
        isGallery: true,
        sortOrder: i,
      });
    }
    prod.mediaRefs = mediaRefs;
    prod.images = [];
    await prod.save({ validateBeforeSave: false });
  }
  console.log(`Migrated ${products.length} product image sets`);

  await mongoose.disconnect();
  process.exit(0);
};

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
