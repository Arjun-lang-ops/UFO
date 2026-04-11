import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp",'avif'],
  },

});

const upload = multer({ storage });

export const uploadVariantImages = upload.fields([
  { name: "variantImages_1", maxCount: 3 },
  { name: "variantImages_2", maxCount: 3 },
  { name: "variantImages_3", maxCount: 3 },
  { name: "variantImages_4", maxCount: 3 },
  { name: "variantImages_5", maxCount: 3 },
]);