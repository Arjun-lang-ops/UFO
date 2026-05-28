import express from "express";
import {
  orderConfirmRender,
  orderDetailsRender,
  orderHistoryRender,
  orderReturnRender,
  placeOrderController,
  requestReturn,
  requestCancel
} from "../controller/userOrderController.js";
import { downloadInvoice } from "../config/pdf.js";
import { isLoggedIn } from "../middlewares/userAuth.js";

const router = express.Router();

router.get("/orderConfirm/:orderId", isLoggedIn, orderConfirmRender);
router.get("/orderHistory", isLoggedIn, orderHistoryRender);
router.get("/orderHistory/:id", isLoggedIn, orderDetailsRender);
router.get("/orderReturn/:id", isLoggedIn, orderReturnRender);
router.post("/checkout/confirm", placeOrderController);
router.get("/invoice/:id/download", isLoggedIn, downloadInvoice);
router.post("/order/returnRequest", requestReturn);
router.post("/order/cancel", requestCancel);

export default router;
