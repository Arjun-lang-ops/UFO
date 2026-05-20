import mongoose from "mongoose";
;

const wishlistSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique:true
    },
    products:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },
        variant:{
            type:mongoose.Schema.Types.ObjectId,
            required:true
        },
        addedAt:{
            type:Date,
            default:Date.now
        }

    }]
    
},{
        timestamps:true
    });


const Wishlist=mongoose.model('Wishlist',wishlistSchema);

export default Wishlist;