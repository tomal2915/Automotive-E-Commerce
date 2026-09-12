import express from "express";
import {
  getAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  addAttributeValue,
  removeAttributeValue,
} from "../controllers/attributeController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = express.Router();
router.use(verifyAccessToken);

router.get("/", requirePermission("attribute:read"), getAttributes);
router.post("/", requirePermission("attribute:create"), createAttribute);
router.put("/:id", requirePermission("attribute:update"), updateAttribute);
router.delete("/:id", requirePermission("attribute:delete"), deleteAttribute);
router.post(
  "/:id/values",
  requirePermission("attribute:update"),
  addAttributeValue,
);
router.delete(
  "/:id/values/:valueId",
  requirePermission("attribute:update"),
  removeAttributeValue,
);

export default router;
