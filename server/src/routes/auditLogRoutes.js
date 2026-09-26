import express from "express";
import { getAuditLogs } from "../controllers/auditLogController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = express.Router();

router.get(
  "/",
  verifyAccessToken,
  requirePermission("audit:watch"),
  getAuditLogs,
);

export default router;
