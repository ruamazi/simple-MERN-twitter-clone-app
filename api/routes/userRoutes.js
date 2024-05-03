import { Router } from "express";
import {
  followUnfollow,
  getSuggestedUsers,
  getUserProfile,
  updateProfile,
} from "../controllers/userController.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = Router();

router.get("/profile/:username", getUserProfile);
router.get("/sugg", protectedRoute, getSuggestedUsers);
router.get("/follow/:targetId", protectedRoute, followUnfollow);
router.post("/update", protectedRoute, updateProfile);

export default router;
