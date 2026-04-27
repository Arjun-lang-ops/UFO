import express from 'express'
const router=express.Router();


import {  productDetailsRender } from '../controller/userProductListController.js';
import { productListRender } from '../controller/userProductListController.js';
import { isLoggedIn } from '../middlewares/userAuth.js';


router.get('/product',isLoggedIn,productListRender)
router.get('/product/:id',isLoggedIn,productDetailsRender)

export default router;