import Category from "../models/categoryModel.js";

export const categoryRender=async (req,res)=>{
    try{
        const categories=await Category.find().sort({createdAt:-1})
        return res.render('adminViews/adminCategoryManagement',{categories});
    }catch(error){
        console.error(error);
        res.render("adminViews/categoryPage", {
        categories: []
    });
    }
    
}


export const addCategoryController=async (req,res)=>{
    try {
        let {name,description,isListed} = req.body;
        name = name.trim();
        description = description.trim();
        console.log(name)

        const existingCategory = await Category.findOne({name:{$regex:`^${name}$`, $options: "i"}});
        console.log("Existing:", existingCategory);

        if(existingCategory){
            return res.json({
                success:false,
                message:'Category already exists'
            })
        }

        const newCategory=new Category({
            name,
            description,
            isListed
        })

        await newCategory.save();
        return res.json({
        success: true,
        message: "Category added successfully"
});
    } catch (error) {
        console.log(error)
        res.json({
            success:false,
            message:'something went wrong'
        })
        
    }
}