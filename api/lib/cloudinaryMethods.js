import { v2 as cloudinary } from "cloudinary";

export const destroyImg = async (img) => {
  const publicId = img.split("/").pop().split(".")[0];
  try {
    await cloudinary.uploader.destroy(`uploads/${publicId}`);
  } catch (err) {
    console.log("Error deleting image from cloudinary", err);
  }
};

export const uploadImg = async (img) => {
  const uploadOptions = {
    resource_type: "image",
    folder: "uploads",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    max_allowed_file_size: 3 * 1024 * 1024, //3MB
  };
  try {
    const ourImg = await cloudinary.uploader.upload(img, uploadOptions);
    return ourImg.secure_url;
  } catch (err) {
    console.log("Error uploading image to cloudinary", err);
  }
};
