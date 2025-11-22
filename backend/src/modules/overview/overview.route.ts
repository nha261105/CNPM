import { Router } from "express";
import { getCardInOverview } from "./overview.controller.js";

const router = Router()

router.get("/card", getCardInOverview)

export default router;