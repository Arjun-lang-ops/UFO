import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
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
        isVerified:false
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


export const userLoginLogic=async (data)=>{
    const {email,password}=data
    const existingUser=await User.findOne({email});

    if(!existingUser){
        throw new Error('user not found');
    }
    const passwordMatch= await bcrypt.compare(password,existingUser.password);
    if(!passwordMatch){
        throw new Error('Invalid Password');
    }
    
    if(!existingUser.isVerified){
        throw new Error('User not verified with OTP');
    }

    return existingUser;
    
}