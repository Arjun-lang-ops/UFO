import express from "express";
import { adminOfferAddRender, adminOfferRender } from "../controller/adminofferController.js";
import { adminLoggedIn } from "../middlewares/adminAuth.js";
const router= express.Router();

router.get('/offers',adminLoggedIn,adminOfferRender)
router.get('/offers/add',adminLoggedIn,adminOfferAddRender)

export default router;