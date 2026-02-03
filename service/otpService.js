import bcrypt from 'bcrypt';
import Otp from '../models/otpModel.js';

export const generateAndSaveOtp=async(email)=>{
    const rawOtp= Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp= await bcrypt.hash(rawOtp,10);

    await Otp.deleteMany({email});
    await Otp.create({
        email,
        otp:hashedOtp,
        expiresAt : new Date(Date.now()+60*1000)
    })
    return rawOtp;
}

export const verifyOtp=async (email,otp)=>{
    const otpRecord=await Otp.findOne({email});
    if (!otpRecord) throw new Error("OTP not found");

    if(otpRecord.expiresAt<new Date()){
        throw new Error ('otp expired');
    }

    const isValid=await bcrypt.compare(otp,otpRecord.otp);
    if(!isValid){
        throw new Error('Invalid OTP'); 
    }
    await Otp.deleteOne({email});
}

