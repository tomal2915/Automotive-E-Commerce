import Media from "../models/Media.js";
import Product from "../models/Product.js";
import MediaFolder from "../models/MediaFolder.js";

const inferType = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "other";
};

// @route POST /api/v1/media/upload (permission: media:upload)
// Accepts one or many files in a single request
export const uploadMedia = async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ message: "No files were uploaded" });
    }

    const created = await Promise.all(
      files.map((file) =>
        Media.create({
          fileName: file.originalname,
          url: file.path, // multer-storage-cloudinary sets this to the secure_url
          thumbnailUrl: file.path.replace(
            "/upload/",
            "/upload/w_200,h_200,c_fill/",
          ), // Cloudinary on-the-fly transform
          mimeType: file.mimetype,
          type: inferType(file.mimetype),
          size: file.size,
          uploadedBy: req.user.id,
        }),
      ),
    );

    res.status(201).json({ media: created });
  } catch (error) {
    res.status(400).json({ message: "Upload failed", error: error.message });
  }
};

// @route GET /api/v1/media (permission: media:read)
export const getMediaLibrary = async (req, res) => {
  try {
    const { page = 1, limit = 24, type, search, folderId } = req.query;

    const filter = {};
    if (type) filter.type = type;

    // "root" is an explicit sentinel meaning "top-level files only" —
    // omitting folderId entirely means "don't filter by folder at all"
    if (folderId === "root") {
      filter.folder = null;
    } else if (folderId) {
      filter.folder = folderId;
    }

    if (search)
      filter.$or = [
        { fileName: new RegExp(search, "i") },
        { title: new RegExp(search, "i") },
      ];

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const [media, total] = await Promise.all([
      Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Media.countDocuments(filter),
    ]);

    res.json({
      media,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route PUT /api/v1/media/:id (permission: media:write)
export const updateMedia = async (req, res) => {
  try {
    const { altText, title } = req.body;
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { altText, title },
      { returnDocument: "after", runValidators: true },
    );
    if (!media) return res.status(404).json({ message: "Media not found" });
    res.json({ media });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid update data", error: error.message });
  }
};

// @route DELETE /api/v1/media/:id (permission: media:delete)
export const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    // Refuse deletion while still attached to a product — leaving a
    // product pointing at a missing file is never acceptable
    const attachedCount = await Product.countDocuments({
      "mediaRefs.media": media._id,
    });
    if (attachedCount > 0) {
      return res.status(409).json({
        message: `This asset is attached to ${attachedCount} product(s). Detach it before deleting.`,
      });
    }

    await media.deleteOne();
    res.json({ message: "Media deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route PUT /api/v1/media/:id/move (permission: media:write)
// Moves a file into a different folder. NOTE: this only updates the DB
// reference — it does NOT physically relocate the asset inside Cloudinary.
// The folder here is a logical grouping for your admin UI, not a guarantee
// that Cloudinary's own storage layout matches it after a move.
export const moveMedia = async (req, res) => {
  try {
    const { folderId } = req.body;

    if (folderId) {
      const folderExists = await MediaFolder.findById(folderId);
      if (!folderExists) {
        return res.status(400).json({ message: "Target folder not found" });
      }
    }

    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { folder: folderId || null },
      { returnDocument: "after", runValidators: true },
    );
    if (!media) return res.status(404).json({ message: "Media not found" });

    res.json({ media });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid move request", error: error.message });
  }
};
