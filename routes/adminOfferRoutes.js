import express from "express";
import { adminOfferAddRender, adminOfferEditRender, adminOfferRender, offerAdd, offerEdit } from "../controller/adminofferController.js";
import { adminLoggedIn } from "../middlewares/adminAuth.js";
const router = express.Router();

router.get('/offers', adminLoggedIn, adminOfferRender)
router.get('/offers/add', adminLoggedIn, adminOfferAddRender)
router.post('/offers/add', adminLoggedIn, offerAdd);
router.get('/offers/edit/:id', adminLoggedIn, adminOfferEditRender);
router.post('/offers/edit/:id', adminLoggedIn, offerEdit);


export default router;
