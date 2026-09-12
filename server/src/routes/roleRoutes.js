import express from "express";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getRoleOptions,
} from "../controllers/roleController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = express.Router();
router.use(verifyAccessToken);

// Any logged-in admin can see the list to assign roles — no role:watch required
router.get("/options", getRoleOptions);

router.get("/", requirePermission("role:watch"), getRoles);
router.post("/", requirePermission("role:create"), createRole);
router.put("/:id", requirePermission("role:update"), updateRole);
router.delete("/:id", requirePermission("role:delete"), deleteRole);

export default router;