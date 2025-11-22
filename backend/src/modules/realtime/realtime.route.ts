import { Router } from "express";
import { createTracking,getCurrentPositionHandler,getAllCurrentPositionsHandler, getStudentInRouteHandler } from "./realtime.controller.js";

const router = Router()

router.put("/",createTracking)

router.get("/:busId/current", getCurrentPositionHandler)

router.get("/all", getAllCurrentPositionsHandler)

router.get("/:busId/students", getStudentInRouteHandler)


export default router;