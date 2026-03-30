import express from 'express'
const router=express.Router();



import { productListRender } from '../controller/userProductListController.js';
import { isLoggedIn } from '../middlewares/userAuth.js';


router.get('/product',isLoggedIn,productListRender)

export default router;