import Order from "../models/orderModel.js"
import { orderManagementService } from "../service/adminOrderService.js";


export const adminOrderManagementRender=async(req,res)=>{
    try {
        const page=Number(req.query.page|| 1);

        const search=req.query.search || "";

        const orderData=await orderManagementService(page,search);

        
        return res.render('adminViews/adminOrderManagement',{orderData});
    } catch (error) {
        console.log(error);

         return res.status(500).render(
        "adminViews/orderManagement",
        {
          orderData: {
            orders: [],
            currentPage: 1,
            totalPages: 1,
            search: ""
          },
          error:
            "Failed to load orders"
        }
      );
    
    }
}


export const orderDetailsRender=async(req,res)=>{
    try {
        return res.render('adminViews/adminOrderDetails')
    } catch (error) {
        console.log(error)
    }
}