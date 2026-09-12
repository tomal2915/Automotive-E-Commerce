import MediaFolder from "../models/MediaFolder.js";

// Walks the parentFolder chain up to the root and returns a Cloudinary-safe
// path segment, e.g. "brand/logos/old" for Brand > Logos > Old
export const getFolderPath = async (folderId) => {
  if (!folderId) return "";

  const segments = [];
  let current = await MediaFolder.findById(folderId);

  while (current) {
    segments.unshift(
      current.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    );
    current = current.parentFolder
      ? await MediaFolder.findById(current.parentFolder)
      : null;
  }

  return segments.join("/");
};
