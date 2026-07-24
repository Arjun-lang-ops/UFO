import express from 'express'
const router=express.Router();


import {  getProducts, productDetailsRender } from '../controller/userProductListController.js';

router.get('/product', getProducts);
router.get('/product/:id', productDetailsRender);

export default router;