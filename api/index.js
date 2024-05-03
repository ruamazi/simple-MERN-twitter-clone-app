import express from "express";
import "dotenv/config";
import path from "path";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import authRouters from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SEC,
});

const app = express();
const PORT = process.env.PORT || 3030;
const __dirname = path.resolve();

app.use(express.json({ limit: "3mb" }));
app.use(cookieParser());

app.get("/api", (req, res) => {
  res.json({ message: "Welcome to Twitter clone API" });
});

app.use("/api/auth", authRouters);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notif", notificationRoutes);

if (process.env.NODE_ENV !== "dev") {
  app.use(express.static(path.join(__dirname, "/client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log(`Server started on port: ${PORT}`);
});
