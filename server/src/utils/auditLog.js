import AuditLog from "../models/AuditLog.js";
import { logger } from "../config/logger.js";

// Never throws — an audit-log write failure should never block or
// break the actual admin action it's recording
export const recordAuditLog = async (
  req,
  action,
  targetModel,
  targetId,
  changes = null,
) => {
  try {
    await AuditLog.create({
      user: req.user.id,
      userEmail: req.user.email || "unknown",
      action,
      targetModel,
      targetId: targetId?.toString(),
      changes,
      ipAddress: req.ip,
    });
  } catch (error) {
    logger.error({ error: error.message, action }, "Failed to write audit log");
  }
};
