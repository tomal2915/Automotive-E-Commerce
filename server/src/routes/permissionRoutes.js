import express from "express";
import {
  createPermissionGroup,
  getPermissions,
  deletePermission,
} from "../controllers/permissionController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = express.Router();
router.use(verifyAccessToken);

router.get("/", requirePermission("permission:watch"), getPermissions);
router.post(
  "/group",
  requirePermission("permission:create"),
  createPermissionGroup,
);
router.delete("/:id", requirePermission("permission:delete"), deletePermission);

export default router;
