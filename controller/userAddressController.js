import User from "../models/userModel.js"; 
import { addAddressLogic } from "../service/userAddressService.js";
import Address from "../models/userAddressModel.js";


export const userAddressRender = async (req, res) => {
  try {

    const userId = req.session.user;

    const addresses = await Address.find({ user: userId });

    res.render("userViews/userAddress", { addresses });

  } catch (error) {
    console.log("Address Render Error:", error);
    res.status(500).send("Server Error");
  }
};

export const editAddressRender=(req,res)=>{
    return res.render('userViews/userEditAddress');
}

export const addAddressController=async(req,res)=>{
    try {
        console.log('session: ',req.session)
        const userId=req.session.user;
        console.log(userId)
        await addAddressLogic(userId,req.body);
        console.log(req.body)

         res.status(200).json({
            success:true,
            message:"Address added successfully",
            redirectUrl:"/profile/address"
        });
        
    } catch (error) {
        console.log('addrressError:',error);
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

