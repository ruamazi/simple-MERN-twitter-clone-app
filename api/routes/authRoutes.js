import { Router } from "express";
import {
  getCurrentUser,
  signin,
  signout,
  signup,
} from "../controllers/authController.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = Router();

router.get("/", protectedRoute, getCurrentUser);
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);

export default router;
