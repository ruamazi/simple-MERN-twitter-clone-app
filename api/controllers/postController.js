import { destroyImg, uploadImg } from "../lib/cloudinaryMethods.js";
import Notification from "../models/Notification.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

export const createPost = async (req, res) => {
  const userId = req.user._id.toString();
  const { text } = req.body;
  let img = req.body.img;
  if (
    (!text && !img) ||
    (text.trim().length === 0 && img.trim().length === 0)
  ) {
    return res
      .status(400)
      .json({ error: "Post must have text or image or both" });
  }
  if (text && text.length > 500) {
    return res.status(400).json({ error: "Max text content is 500 letters" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (img) {
      img = await uploadImg(img);
    }
    const newPost = new Post({
      user: userId,
      img,
      text,
    });
    await newPost.save();
    res.status(202).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userPosts = await Post.find({ user: user._id })
      .populate("user", "username fullName profileImg")
      .populate("comments.user", "username fullName profileImg")
      .sort({ createdAt: -1 });
    res.status(200).json(userPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePost = async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  const userId = req.user._id.toString();
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (userId !== post.user.toString()) {
      const errMsg = "Not authorized for this action";
      return res.status(401).json({ message: errMsg });
    }
    if (post.img && post.img.includes("cloudinary")) {
      await destroyImg(post.img);
    }
    await Post.findOneAndDelete({ _id: postId });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likePost = async (req, res) => {
  const userId = req.user._id.toString();
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
    } else {
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      const notify = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notify.save();
    }
    await post.save();
    res.status(200).json(post.likes);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const commentOnPost = async (req, res) => {
  const userId = req.user._id.toString();
  const { text, postId } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "Comment field should not be empty" });
  }
  if (text.length > 100) {
    return res.status(400).json({ error: "Comment is too long" });
  }
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  const commentObj = { user: userId, text };
  post.comments.push(commentObj);
  await post.save();
  res.status(200).json(post);
  try {
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username fullName profileImg")
      .populate("comments.user", "username fullName profileImg")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikedPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate("user", "username fullName profileImg")
      .populate("comments.user", "username fullName profileImg")
      .sort({ createdAt: -1 });
    res.status(200).json(likedPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const followedUsersPosts = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { following } = user;
    const feedPosts = await Post.find({ user: { $in: following } })
      .populate("user", "username fullName profileImg")
      .populate("comments.user", "username fullName profileImg")
      .sort({ createdAt: -1 });
    res.status(200).json(feedPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
