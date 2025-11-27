import { Router } from "express";
import {
  createTracking,
  getCurrentPositionHandler,
  getAllCurrentPositionsHandler,
  getStudentInRouteHandler,
  getTodaySchedulesHandler,
} from "./realtime.controller.js";

const router = Router();

router.put("/", createTracking);

router.get("/:busId/current", getCurrentPositionHandler);

router.get("/all", getAllCurrentPositionsHandler);

router.get("/:busId/students", getStudentInRouteHandler);

//  Route mới
router.get("/schedules", getTodaySchedulesHandler);


export default router;
