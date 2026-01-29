import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
      default: undefined
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema, 'urbanfootball');

export default User;
