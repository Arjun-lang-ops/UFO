import express from "express";
import {
  orderConfirmRender,
  orderDetailsRender,
  orderHistoryRender,
  orderReturnRender,
  placeOrderController,
  requestReturn,
  requestCancel,
  verifyPaymentController,
  retryPaymentController,
  orderFailureRender
} from "../controller/userOrderController.js";
import { downloadInvoice } from "../config/pdf.js";
import { isLoggedIn,checkUserBlocked } from "../middlewares/userAuth.js";

const router = express.Router();

router.get("/orderConfirm/:orderId", isLoggedIn,checkUserBlocked, orderConfirmRender);
router.get('/orderFailure/:id',isLoggedIn,checkUserBlocked,orderFailureRender)
router.get("/orderHistory", isLoggedIn, checkUserBlocked,orderHistoryRender);
router.get("/orderHistory/:id", isLoggedIn, checkUserBlocked,orderDetailsRender);
router.get("/orderReturn/:id", isLoggedIn, checkUserBlocked,orderReturnRender);
router.post("/checkout/confirm",isLoggedIn,checkUserBlocked, placeOrderController);
router.get("/invoice/:id/download", isLoggedIn, downloadInvoice);
router.post("/order/returnRequest",isLoggedIn, requestReturn);
router.post("/order/cancel",isLoggedIn, requestCancel);
router.post("/checkout/verify-payment", isLoggedIn, verifyPaymentController);
router.post("/order/retry-payment/:orderId", isLoggedIn, retryPaymentController);

export default router;
