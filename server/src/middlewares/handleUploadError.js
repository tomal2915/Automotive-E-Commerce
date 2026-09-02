import multer from "multer";

// Wraps Multer's own errors (file too large, too many files, etc.)
// into our standard JSON error response shape
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};