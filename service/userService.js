import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import Address from '../models/userAddressModel.js';
import { generateAndSaveOtp } from './otpService.js';
import { sendMail } from '../utils/mailer.js';


export const registerUserLogic = async (data) => {
    const { fullname, email, password } = data;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User already Exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullname,
        email,
        password: hashedPassword,
        isVerified: false
    });

    return user;

}

// export const resendOtpLogic = async (email) => {
//     const user = await User.findOne({ email });

//     if (!user) throw new Error('User not found');
//     if (user.isVerified) throw new Error('User already verified');

//     return true;
// };


export const verifyUserOtp = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('user not found')
    }

    user.isVerified = true;

    await user.save();
    return true

};

//user login
export const userLoginLogic = async (data) => {
    const { email, password } = data
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        throw new Error('user not found');
    }
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
        throw new Error('Invalid Password');
    }

    if (!existingUser.isVerified) {
        throw new Error('User not verified with OTP');
    }

    return existingUser;

}

export const forgotUserService = async (data) => {
    const { email } = data;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        throw new Error('Invalid Email Address');
    };

    return existingUser
}


export const changePasswordService = async (userId, currentPassword, newPassword) => {
    if (!userId) {
        throw new Error('Unauthorized Access')
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('user not found')
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new Error('Current password is incorrect')
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
        throw new Error('New password cannot be same as old password')
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return 'password updated successfully'

}


export const addAddressService = async (userId, data) => {
    if (data.isDefault) {
        await Address.updateMany(
            { user: userId }, { $set: { isDefault: true } })
    }
    const address = new Address({ ...data, user: userId });
    return await Address.save()
}

export const editAddressLogic = async (userId, addressId, data) => {

    const address = await Address.findOne({
        _id: addressId,
        user: userId
    });

    if (!address) {
        throw new Error("Address not found");
    }

    if (data.isDefault) {
        await Address.updateMany(
            { user: userId },
            { $set: { isDefault: false } }
        );
    }

    Object.assign(address, data);

    return await address.save();
};


export const deleteAddressLogic = async (userId, addressId) => {

    const address = await Address.findOneAndDelete({
        _id: addressId,
        user: userId
    });

    if (!address) {
        throw new Error("Address not found");
    }

    return address;
};


export const getUserAddressesLogic = async (userId) => {
    return await Address.find({ user: userId })
        .sort({ isDefault: -1, createdAt: -1 });
};