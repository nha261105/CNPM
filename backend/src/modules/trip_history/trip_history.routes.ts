import { Router } from "express";
import { TripHistoryController } from "./trip_history.controller.js";

const router = Router();

router.get("/trip-history", TripHistoryController.getByStudentId);
router.get(
  "/trip-history/parent/:parent_id",
  TripHistoryController.getByParentId
);
router.post("/trip-history", TripHistoryController.create);

export default router;
