

export const productRender=async(req,res)=>{
    return res.render('adminViews/adminProductManagement')
}


export const AddProduct=async(req,res)=>{
    
      return  res.render('adminViews/adminProductAdd')
        
    
}

export const editProduct=(req,res)=>{
    return res.render('adminViews/adminProductEdit')
}