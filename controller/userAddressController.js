import User from "../models/userModel.js"; 
import { addAddressLogic, getSingleAddressService ,updateAddressService} from "../service/userAddressService.js";
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

export const editAddressRender=async(req,res)=>{

    try {
        const userId=req.session.user;
        const addressId=req.params.id;
        const address=await getSingleAddressService(userId,addressId);
        if(!address){
            return res.redirect('/profile/address');
        }

        return res.render('userViews/userEditAddress',{address});
    } catch (error) {
        console.log(error);
        res.redirect('/profile/address')
    }
    
}

export const updateAddressController=async (req,res)=>{
    try {
        const userId=req.session.user;
        const addressId=req.params.id;

        const result=await updateAddressService(userId,addressId,req.body);
         if (!result) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        res.json({
            success: true,
            message: "Address updated successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}


export const removeAddressController=async(req,res)=>{
    try {
        const userId=req.session.user;
        const addressId=req.params.id;
        await Address.deleteOne({user:userId,_id:addressId});
        res.status(200).json({
            success:true,
            message:"Address removed successfully",
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

export const setDefaultAddressController = async (req, res) => {
    try {
        const userId = req.session.user;
        const addressId = req.params.id;

        await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
        await Address.updateOne({ _id: addressId, user: userId }, { $set: { isDefault: true } });

        res.status(200).json({
            success: true,
            message: "Default address updated successfully"
        });
    } catch (error) {
        console.log('setDefaultAddressError:', error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}
