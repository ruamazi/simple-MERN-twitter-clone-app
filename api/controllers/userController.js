import { destroyImg, uploadImg } from "../lib/cloudinaryMethods.js";
import { pswErrMsg, validatePassword } from "../lib/validations.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.log("error in getUserProfile function", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const followUnfollow = async (req, res) => {
  const { targetId } = req.params;
  const { _id: myId } = req.user;
  if (targetId === myId.toString()) {
    return res.status(400).json({ error: "This action not allowed" });
  }
  try {
    const target = await User.findById(targetId);
    const currentUser = await User.findById(myId);
    if (!target || !currentUser) {
      return res.status(404).json({ error: "Unavailable account" });
    }
    const isFollowing = currentUser.following.includes(targetId);
    let action;
    if (isFollowing) {
      target.followers.pull(myId);
      currentUser.following.pull(targetId);
      action = "unfollowed";
    } else {
      target.followers.push(myId);
      currentUser.following.push(targetId);
      action = "followed";
      const newNotification = new Notification({
        type: "follow",
        from: myId,
        to: targetId,
      });
      await newNotification.save();
    }
    await target.save();
    await currentUser.save();
    res.status(200).json({
      message: `User ${action} successfully`,
    });
  } catch (err) {
    console.log("error in followUnfollow function", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  const { fullName, password, bio, newPassword, link, profileImg, coverImg } =
    req.body;
  const userId = req.user._id;
  if ((password && !newPassword) || (!password && newPassword)) {
    return res
      .status(400)
      .json({ error: "Provide both current password and the new one" });
  }
  if (password && newPassword && !validatePassword(newPassword)) {
    return res.status(400).json({ error: pswErrMsg });
  }
  if (newPassword && newPassword.length > 30) {
    return res.status(400).json({ error: "New password is too long" });
  }
  if (fullName && fullName.length > 30) {
    return res.status(400).json({ error: "Full name too long" });
  }
  if (fullName && fullName.split(" ").length > 2) {
    return res
      .status(400)
      .json({ error: "Full name should contain at most two words" });
  }
  if (bio && bio.length > 250) {
    return res
      .status(400)
      .json({ error: "Bio should not contain more than 250 letters" });
  }
  if (link && !link.startsWith("https://")) {
    return res.status(400).json({ error: "Link should start with https:// " });
  }
  if (link && link.length > 40) {
    return res.status(400).json({ error: "Link is too long" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (password && newPassword) {
      const pswMatch = await bcrypt.compare(password, user.password);
      if (!pswMatch) {
        return res
          .status(400)
          .json({ error: "Current password does not match" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    if (profileImg) {
      if (user.profileImg.includes("cloudinary")) {
        await destroyImg(user.profileImg);
      }
      user.profileImg = await uploadImg(profileImg);
    }
    if (coverImg) {
      if (user.coverImg.includes("cloudinary")) {
        await destroyImg(user.coverImg);
      }

      user.coverImg = await uploadImg(coverImg);
    }
    user.fullName = fullName || user.fullName;
    user.bio = bio || user.bio;
    user.link = link || "";

    await user.save();
    const { password: userPsw, ...filteredUser } = user.toObject();
    return res.status(200).json(filteredUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  const { _id: myId } = req.user;
  try {
    const followedUsers = await User.findById(myId).select("following");
    const users = await User.aggregate([
      { $match: { _id: { $ne: myId } } },
      { $sample: { size: 10 } },
      { $project: { password: 0 } },
    ]);
    const filteredUsers = users.filter(
      (user) => !followedUsers.following.includes(user._id)
    );
    const usersToSuggest = filteredUsers.slice(0, 4);
    res.status(200).json(usersToSuggest);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
