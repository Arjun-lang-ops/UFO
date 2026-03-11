import Address from "../models/userAddressModel.js";
import User from "../models/userModel.js";

export const addAddressLogic=(userId,data)=>{

    console.log('userId in service',userId)

    const newAddress=new Address({
        user:userId,
        fullname:data.fullname,
        phone:data.phone,
        pincode:data.pincode,
        state:data.state,
        city:data.city,
        country:data.country,
        street:data.street,
        apartment:data.apartment
    })
    console.log('newAddress:',newAddress)
    return newAddress.save()

}

export const getSingleAddressService = async (userId, addressId) => {

   const address=await Address.findOne({
    _id:addressId,
    user:userId
   })
   return address

};

export const updateAddressService=async (userId,addressId,addressData)=>{
    const data={
        fullname:addressData.fullname,
        phone:addressData.phone,
        street:addressData.street,
        apartment:addressData.apartment,
        state:addressData.state,
        country:addressData.country,
        pincode:addressData.pincode
    }

    const updatedAddress= await Address.findByIdAndUpdate({_id:addressId,user:userId},data,{new:true});
    return updatedAddress
}