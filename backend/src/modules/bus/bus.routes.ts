import { Router } from "express";
import * as busController from "./bus.controller.js";

const router = Router();

router.get("/", busController.getBuses);
router.put("/:id", busController.updateBus);
router.post("/", busController.addBus);
router.get("/location", busController.getBusLocationByParentId);

export default router;
