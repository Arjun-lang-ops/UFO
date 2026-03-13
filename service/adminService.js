// import bcrypt from 'bcrypt';

import User from "../models/userModel.js";

// import Admin from '../models/adminModel';
export const userLoad = async (filter = {}) => {
    try {

        let user = await User.find(filter)
            .sort({ createdAt: -1 })

        if (!user) {
            return {
                success: false,
                message: "Error"
            }
        }
        return {
            success: true,
            data: user
        }
    } catch (e) {
        console.log(e)
        return {
            success: false,
            message: "Server error"
        }
    }
}

// Paginated 
export const userLoadPaginated = async ({filter={},page=1,limit=4 }={})=> {
    try {
        const skip = (page-1) * limit;

        const [users, totalUsers] = await Promise.all([
            User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalUsers / limit);

        return {
            success: true,
            data: users,
            totalUsers,
            totalPages,
            currentPage: page
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Server error"
        };
    }
};

export const adminLoginService = async (data) => {

    const { email, password } = data

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail) {
        throw new Error("Invalid admin email");
    }

    if (password !== adminPassword) {
        throw new Error("Invalid admin password");
    }

    return true;

};
