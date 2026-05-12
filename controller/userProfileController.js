import cloudinary from "../config/cloudinary.js";
import User from "../models/userModel.js";

export const updateProfilePhotoController = async (req, res) => {
  try {
    const userId = req.user?._id||req.session.user;

    //  Get uploaded image data
    const imageUrl = req.file.path;
    const publicId = req.file.filename;

    // Find user
    const user = await User.findById(userId);

    // Delete old image 
    if (user.profileImage?.public_id) {
      await cloudinary.uploader.destroy(user.profileImage.public_id);
    }

    // Save new image
    user.profileImage = {
      url: imageUrl,
      public_id: publicId
    };

    await user.save();

    res.status(200).json({
      message: "Profile image updated successfully",
      profileImage: user.profileImage
    });

  } catch (error) {
    res.status(500).json({
      error: "Upload failed"
    });
  }
};