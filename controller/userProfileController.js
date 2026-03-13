import User from "../models/userModel.js";

export const updateProfilePhotoController = async (req, res) => {
  try {

    const userId = req.session.userId;

    const imagePath = "/uploads/profile/" + req.file.filename;

    await User.findByIdAndUpdate(userId, {
      profileImage: imagePath
    });

     res.json({
      success: true,
      imageUrl: imagePath
    });

  } catch (error) {
    console.log(error);
    res.json({
      success:false,
      message:'image upload failed'
    })
  }
};

