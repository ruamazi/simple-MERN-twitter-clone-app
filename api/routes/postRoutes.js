import { Router } from "express";
import {
  commentOnPost,
  createPost,
  deletePost,
  followedUsersPosts,
  getLikedPosts,
  getPosts,
  getUserPosts,
  likePost,
  updatePost,
} from "../controllers/postController.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = Router();

router.get("/user/:username", getUserPosts);
router.get("/all", getPosts);
router.get("/liked/:username", getLikedPosts);
router.get("/following", protectedRoute, followedUsersPosts);
router.post("/create", protectedRoute, createPost);
router.post("/update", protectedRoute, updatePost);
router.delete("/delete/:postId", protectedRoute, deletePost);
router.get("/like/:postId", protectedRoute, likePost);
router.post("/comment", protectedRoute, commentOnPost);

export default router;
