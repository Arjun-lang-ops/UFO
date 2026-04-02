import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // your config file

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_images", // like your old folder
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: (req, file) => {
      return Date.now() + "-" + file.originalname;
    }
  }
});

export const upload = multer({ storage });