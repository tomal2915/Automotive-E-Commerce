import AuditLog from "../models/AuditLog.js";
import { parsePagination, buildPaginationMeta } from "../utils/paginate.js";

export const getAuditLogs = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, {
      defaultLimit: 30,
    });

    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(),
    ]);

    res.json({ logs, pagination: buildPaginationMeta(total, page, limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
