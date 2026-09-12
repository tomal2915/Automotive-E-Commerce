import MediaFolder from "../models/MediaFolder.js";
import Media from "../models/Media.js";

// @route GET /api/v1/media/folders?parentId=<id> (omit parentId for root level)
export const getFolders = async (req, res) => {
  try {
    const { parentId } = req.query;
    const folders = await MediaFolder.find({
      parentFolder: parentId || null,
    }).sort({ name: 1 });
    res.json({ folders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/media/folders/:id/breadcrumb
// Root-first ancestor chain — lets the frontend render "Brand / Logos / Old"
export const getFolderBreadcrumb = async (req, res) => {
  try {
    const trail = [];
    let current = await MediaFolder.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Folder not found" });

    while (current) {
      trail.unshift({ _id: current._id, name: current.name });
      current = current.parentFolder
        ? await MediaFolder.findById(current.parentFolder)
        : null;
    }
    res.json({ breadcrumb: trail });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/media/folders (permission: mediaFolder:create)
export const createFolder = async (req, res) => {
  try {
    const { name, parentFolder } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    if (parentFolder) {
      const parentExists = await MediaFolder.findById(parentFolder);
      if (!parentExists) {
        return res.status(400).json({ message: "Parent folder not found" });
      }
    }

    const folder = await MediaFolder.create({
      name: name.trim(),
      parentFolder: parentFolder || null,
      createdBy: req.user.id,
    });

    res.status(201).json({ folder });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A folder with this name already exists here" });
    }
    res
      .status(400)
      .json({ message: "Invalid folder data", error: error.message });
  }
};

// @route PUT /api/v1/media/folders/:id (permission: mediaFolder:update)
// Rename only — moving a folder under a different parent isn't supported
// yet, since it would require re-pathing every descendant's Cloudinary folder
export const renameFolder = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const folder = await MediaFolder.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { returnDocument: "after", runValidators: true },
    );
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    res.json({ folder });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A folder with this name already exists here" });
    }
    res
      .status(400)
      .json({ message: "Invalid folder data", error: error.message });
  }
};

// @route DELETE /api/v1/media/folders/:id (permission: mediaFolder:delete)
export const deleteFolder = async (req, res) => {
  try {
    const folder = await MediaFolder.findById(req.params.id);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    // Same "detach before delete" principle as product-attached media —
    // refuse while it still holds subfolders or files
    const [subfolderCount, mediaCount] = await Promise.all([
      MediaFolder.countDocuments({ parentFolder: folder._id }),
      Media.countDocuments({ folder: folder._id }),
    ]);

    if (subfolderCount > 0 || mediaCount > 0) {
      return res.status(409).json({
        message: `This folder contains ${subfolderCount} subfolder(s) and ${mediaCount} file(s). Empty it before deleting.`,
      });
    }

    await folder.deleteOne();
    res.json({ message: "Folder deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
