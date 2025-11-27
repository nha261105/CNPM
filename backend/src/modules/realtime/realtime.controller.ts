import type { Request, Response } from "express";
import {
  createTrackingRecord,
  fetchCurrentPosition,
  fetchAllCurrentPositions,
  fetchAllStudentInRoute,
  getTodaySchedulesForAdmin
} from "./realtime.service.js";

export async function createTracking(req: Request, res: Response) {
  try {
    const { bus_id, latitude, longitude } = req.body;
    if (
      typeof bus_id !== "number" ||
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }
    await createTrackingRecord({ bus_id, latitude, longitude });
    return res.json({ ok: true });
  } catch (err) {
    console.error("createTracking error:", err);
    return res.status(500).json({ ok: false, error: "Failed to create tracking" });
  }
}

export async function getCurrentPositionHandler(req: Request, res: Response) {
  try {
    const busId = Number(req.params.busId);
    if (!Number.isFinite(busId)) {
      return res.status(400).json({ ok: false, error: "Invalid busId" });
    }
    const data = await fetchCurrentPosition(busId);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("getCurrentPositionHandler error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch position" });
  }
}

export async function getAllCurrentPositionsHandler(req: Request, res: Response) {
  try {
    const data = await fetchAllCurrentPositions();
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("getAllCurrentPositionsHandler error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch positions" });
  }
}

export async function getStudentInRouteHandler(req: Request, res: Response) {
  try {
    const busId = Number(req.params.busId);
    if (!Number.isFinite(busId)) {
      return res.status(400).json({ ok: false, error: "Invalid busId" });
    }
    const data = await fetchAllStudentInRoute(busId);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("getStudentInRouteHandler error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch students" });
  }
}


/**
 *  GET /api/admin/realtime/schedules - Lấy schedules hôm nay kèm students
 */
export async function getTodaySchedulesHandler(req: Request, res: Response) {
  try {
    const schedules = await getTodaySchedulesForAdmin();
    return res.json({ ok: true, data: schedules });
  } catch (error: any) {
    console.error(" Get today schedules error:", error);
    return res.status(500).json({ ok: false, message: error.message });
  }
}