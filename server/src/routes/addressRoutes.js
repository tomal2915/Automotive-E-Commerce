import express from "express";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();

router.use(verifyAccessToken);

router.get("/", getAddresses);
router.post("/", createAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;