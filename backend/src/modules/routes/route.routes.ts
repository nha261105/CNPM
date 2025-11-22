import { Router } from "express";
import * as routeController from "./route.controller.js";

const router = Router();

router.get("/", routeController.getRoutes);

export default router;