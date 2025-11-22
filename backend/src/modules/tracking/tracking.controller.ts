import {
  handleTracking,
  getAllCurrentPos,
  getCurrrentPosition,
} from "./tracking.service.js";
import type { Request, Response } from "express";
/**
 * POST/api/tracking
 * GPS device hoặc driver app gửi vị trí
 */
export async function createTracking(req: Request, res: Response) {
  try {
    await handleTracking(req.body);
    return res.json({ success: true, message: "cập nhập tracking" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
/**
 * GET /api/tracking/:busId/current
 * Lấy vị trí hiện tại của bus
 */
export async function getCurrentPositionHandler(req: Request, res: Response) {
  try {
    const { busId } = req.params;
    const pos = await getCurrrentPosition(Number(busId));
    return res.json({ success: true, data: pos });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
/**
 * GET /api/tracking/all
 * Lấy vị trí hiện tại của tất cả bus (cho admin map)
 */
export async function getAllCurrentPositionsHandler(
  req: Request,
  res: Response
) {
  try {
    const positions = await getAllCurrentPos();
    return res.json({ success: true, data: positions });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}


/**
 * GET danh sach student di kem [busid,lat,lng]
 * Lấy cac vi tri cua student
 */