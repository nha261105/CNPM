import { Router } from "express";
import * as pickupController from "./pickup_point.controller.js";


const router = Router();
router.get("/", pickupController.getAllPickup);
router.post("/update", pickupController.updatePickUp);

export default router