import express from "express";
import {
  adminOrderManagementRender,
  orderDetailsRender,
  updateOrderStatus,
  approveReturnController
} from "../controller/adminOrderController.js";
import { downloadInvoice } from "../config/pdf.js";
const router = express.Router();

router.get("/orderManagement", adminOrderManagementRender);
router.get("/orderManagement/:id", orderDetailsRender);
router.post("/orders/:id/status", updateOrderStatus);
router.get("/invoice/:id/download", downloadInvoice);
router.post("/orders/:orderId/return/:itemId", approveReturnController);

export default router;
