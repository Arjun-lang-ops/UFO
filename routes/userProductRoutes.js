import express from 'express'
const router=express.Router();
import { productListRender } from '../controller/userProductListController.js';
router.get('/product',productListRender)

export default router;