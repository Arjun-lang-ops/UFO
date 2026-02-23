import mongoose from "mongoose";

const addressSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        requires:true,
        index:true
    },
    
})