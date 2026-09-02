import express from "express";
import { getWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlistController.js";
import { verifyAccessToken } from "../middlewares/verifyAccessToken.js";

const router = express.Router();

router.use(verifyAccessToken);

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;