import { Router } from "express";
import * as pickupController from "./pickup_point.controller.js";


const router = Router();
router.get("/", pickupController.getAllPickup);

export default router