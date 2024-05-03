import formattedUser from "../lib/formattedUser.js";
import { generateTokenAndSetCookie } from "../lib/token.js";
import {
  pswErrMsg,
  validateEmail,
  validatePassword,
  validateUsername,
} from "../lib/validations.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { username, fullName, email, password } = req.body;
  if (!username || username.trim().length === 0 || !password || !email) {
    return res.status(400).json({ error: "Please fill required fields" });
  }
  if (!validateUsername(username)) {
    return res.status(400).json({ error: "Invalid username format" });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: pswErrMsg });
  }
  if (password.length > 30) {
    return res.status(400).json({ error: "Password is too long" });
  }
  try {
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck) {
      return res.status(400).json({ error: "Username already taken" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ error: "You are already registred, please login" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPsw = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPsw,
    });
    if (!newUser) {
      res.status(400).json({ error: "Invalid user data" });
    }
    generateTokenAndSetCookie(newUser._id, res);
    await newUser.save();
    res.status(201).json(formattedUser(newUser));
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const signin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Wrong credentials" });
    }
    const pswCheck = await bcrypt.compare(password, user.password);
    if (!pswCheck) {
      return res.status(401).json({ error: "Wrong credentials" });
    }
    generateTokenAndSetCookie(user._id, res);
    res.status(200).json(formattedUser(user));
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const signout = async (req, res) => {
  try {
    res.cookie("jwt_x", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  if (!req.user._id) {
    return res.status(401).json({ error: "Unauthenticated" });
  }
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
