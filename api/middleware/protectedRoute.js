import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = async (req, res, next) => {
  const token = req.cookies.jwt_x;
  if (!token) {
    return res.status(401).json({ error: "Token error!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SEC);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }
    //TODO: select only id instead of all user fields
    //for now we using onlu _id from this
    const user = await User.findById(decoded.userId).select("_id");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("Error in protectedRoute middleware", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
