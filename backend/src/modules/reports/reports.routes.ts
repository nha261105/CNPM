import { Router } from "express";
import { sendReportFromDriverToAdminHandle,getAllReportFromAdminHandle } from "./reports.controller.js";

const router = Router()

router.post("/admin", sendReportFromDriverToAdminHandle)

router.get("/admin/:driverId", getAllReportFromAdminHandle)

export default router;