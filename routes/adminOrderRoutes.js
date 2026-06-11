import express from "express";
import {
  adminOrderManagementRender,
  orderDetailsRender,
  updateOrderStatus,
  approveReturnController
} from "../controller/adminOrderController.js";
import { downloadInvoice } from "../config/pdf.js";
import { adminLoggedIn } from "../middlewares/adminAuth.js";
const router = express.Router();

router.get("/orderManagement",adminLoggedIn, adminOrderManagementRender);
router.get("/orderManagement/:id",adminLoggedIn, orderDetailsRender);
router.post("/orders/:id/status",adminLoggedIn, updateOrderStatus);
router.get("/invoice/:id/download",adminLoggedIn, downloadInvoice);
router.post("/orders/:orderId/return/:itemId",adminLoggedIn, approveReturnController);

export default router;
