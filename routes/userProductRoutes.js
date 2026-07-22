import express from 'express'
const router=express.Router();


import {  getProducts, productDetailsRender } from '../controller/userProductListController.js';
//import { productListRender } from '../controller/userProductListController.js';
import { isLoggedIn,checkUserBlocked } from '../middlewares/userAuth.js';


//router.get('/product',isLoggedIn,productListRender);
router.get('/product',isLoggedIn,checkUserBlocked ,getProducts)
router.get('/product/:id',isLoggedIn,checkUserBlocked,productDetailsRender)

export default router;