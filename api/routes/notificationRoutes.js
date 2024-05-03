import { Router } from "express";
import {
  deleteNotification,
  deleteNotifications,
  getNotifications,
} from "../controllers/notificationController.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = Router();

router.get("/", protectedRoute, getNotifications);
router.delete("/all", protectedRoute, deleteNotifications);
router.delete("/one/:notificationId", protectedRoute, deleteNotification);

export default router;
