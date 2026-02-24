import bcrypt from 'bcrypt';

export const adminLoginService=(data)=>{

    const adminEmail='admin@gmail.com';
    const adminPassword='Admin@123';

    const {email,password}=data;
    if(adminEmail!==email && adminPassword!==password){
        throw new Error('Invalid credential')
    }

    return {
        success:true
    }

    
}