import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import { generateAndSaveOtp } from './otpService.js';


export const registerUserLogic=async (data)=>{
    const {fullname,email,password}=data;
    const existingUser=await User.findOne({email});
    if(existingUser){
        throw new Error('User already Exists')
    }

    const hashedPassword= await bcrypt.hash(password,10);

    const user=await User.create({
        fullname,
        email,
        password:hashedPassword
    });

    const otp= await generateAndSaveOtp(email);

    await sendMail(
        email,
        'Verify your Account',
        `Your otp is ${otp}. It is valid for 1 minute`
    );
    return user;

}

export const verifyUserOtp=async(email)=>{
    const user=await User.findOne({email});
    if(!user){
        throw new Error('user not found')
    }

    user.isVerified=true;

    await user.save();

}