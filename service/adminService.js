// import bcrypt from 'bcrypt';

import User from "../models/userModel.js";

// import Admin from '../models/adminModel';
export const userLoad = async(filter={})=>{
    try{

        let user = await User.find(filter)
            .sort({createdAt:-1})
        
        if(!user){
            return{
                success:false,
                message:"Error"
            }
        }
        return {
            success:true,
            data:user
        }
    }catch(e){
        console.log(e)
        return{
            success:false,
            message:"Server error"
        }
    }
}

export const adminLoginService=async (data)=>{

    const {email,password}=data

    const adminEmail= process.env.ADMIN_EMAIL;
    const adminPassword= process.env.ADMIN_PASSWORD;

    if (email !== adminEmail) {
    throw new Error("Invalid admin email");
    }

    if (password !== adminPassword) {
        throw new Error("Invalid admin password");
    }

    return true;

};
