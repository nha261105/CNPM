import type { Request, Response } from "express";
import { TripHistoryService } from "./trip_history.service.js";

export class TripHistoryController {
  static async getByStudentId(req: Request, res: Response) {
    const student_id = Number(req.query.student_id);
    if (!student_id)
      return res
        .status(400)
        .json({ success: false, message: "student_id is required" });
    const result = await TripHistoryService.getByStudentId(student_id);
    return res.json(result);
  }

  static async getByParentId(req: Request, res: Response) {
    const parent_id = Number(req.params.parent_id);
    if (!parent_id)
      return res
        .status(400)
        .json({ success: false, message: "parent_id is required" });
    const result = await TripHistoryService.getByParentId(parent_id);
    return res.json(result);
  }

  static async create(req: Request, res: Response) {
    const entry = req.body;
    if (!entry || !entry.student_id || !entry.schedule_id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    const result = await TripHistoryService.create(entry);
    return res.json(result);
  }
}
