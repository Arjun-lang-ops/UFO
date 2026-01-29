import { homePageRender, landingPageRender, loginRender, registerOtp, registerRender } from "../controller/userController.js";
import express from "express";

const router=express.Router();


router.get('/',landingPageRender)
router.get('/register',registerRender);
router.get('/login',loginRender);
router.get('/home',homePageRender)
router.get('/otp',registerOtp);


export default router;