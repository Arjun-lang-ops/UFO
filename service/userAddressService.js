import Address from "../models/userAddressModel.js";

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