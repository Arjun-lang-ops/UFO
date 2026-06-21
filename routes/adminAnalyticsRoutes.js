import express from "express";
import { analyticsRender } from "../controller/adminAnalyticsController.js";
import { analyticsPdfExport, analyticsExcelExport } from "../config/analytics.js";
import { adminLoggedIn } from "../middlewares/adminAuth.js";

const router = express.Router();

router.get('/analytics',           adminLoggedIn, analyticsRender);
router.get('/analytics/export/pdf',   adminLoggedIn, analyticsPdfExport);
router.get('/analytics/export/excel', adminLoggedIn, analyticsExcelExport);

export default router;
