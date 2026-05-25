import Order from "../models/orderModel.js";
import User from "../models/userModel.js";

export const orderManagementService=async(page,search)=>{

    const limit=4;

    const skip=(page-1)*limit;

    const filter={};

    if (search && search.trim()) {
        const users = await User.find(
            {
                fullname: {
                    $regex: search,
                    $options: "i"
                }
            },
            "_id"
        );

        const userIds = users.map(user => user._id);

        filter.$or = [
            {
                orderNumber: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                user: {
                    $in: userIds
                }
            }
        ];
    }

    const orders=await Order.find(filter).populate('user','fullname email').sort({createdAt:-1}).skip(skip).limit(limit);


    const totalOrders= await Order.countDocuments(filter);

    const totalPages=Math.ceil(totalOrders/limit);

    return {
        orders,
        currentPage:Number(page),
        totalPages,
        search

    }

}