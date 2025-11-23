import supabase from "../../config/supabaseClient.js";
import {
  createSchedule,
  getAllSchedule,
  deleteSchedule,
  updateSchedule,
  getAllDrivers,
  getAllBuses,
  getAllRoutes,
} from "./schedule.service.js";
import type { Request, Response } from "express";
/**
 * GET /api/schedule/admin/drivers
 * Lấy danh sách drivers (cho admin chọn)
 */
export async function getDriversHandler(req: Request, res: Response) {
  try {
    const drivers = await getAllDrivers();
    return res.json({ success: true, data: drivers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/schedule/admin/routes
 * Lấy danh sách routes
 */
export async function getRoutesHandler(req: Request, res: Response) {
  try {
    const routes = await getAllRoutes();
    return res.json({ success: true, data: routes });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/schedule/admin/routes
 * Lấy danh sách buses
 */
export async function getBusesHandler(req: Request, res: Response) {
  try {
    const buses = await getAllBuses();
    return res.json({ success: true, data: buses });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/schedule/admin
 * Tạo schedule mới
 */
export async function createScheduleHandler(req: Request, res: Response) {
  try {
    const schedule = await createSchedule(req.body);
    return res.status(200).json({
      success: true,
      data: schedule,
      message: "Tạo thành công",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/schedule/admin/all
 * Lấy tất cả schedules
 */
export async function getAllSchedulesHandler(req: Request, res: Response) {
  try {
    const { date, driver_id, bus_id, route_id } = req.query;
    const user = (req as any).user;

    const filter: any = {};
    if (date) filter.date = date;

    if (user?.accountType === "driver") {
      filter.driver_id = user.userId;
    } else if (driver_id) {
      filter.driver_id = Number(driver_id);
    }

    if (bus_id) filter.bus_id = Number(bus_id);
    if (route_id) filter.route_id = Number(route_id);
    const allSchedule = await getAllSchedule(
      Object.keys(filter).length > 0 ? filter : undefined
    );
    return res.status(200).json({
      success: true,
      data: allSchedule,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * POST / api/schedule/admin
 * update lịch trình
 */
export async function updateScheduleHandler(req: Request, res: Response) {
  const { old_data, new_data } = req.body as any;
  try {
    if (!old_data || !new_data) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin old hoặc new data",
      });
    }
    const schedule = await updateSchedule(old_data, new_data);
    return res.json({
      success: true,
      data: schedule,
      message: "update lịch trình thành công",
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "lỗi khi update lịch trình" });
  }
}

/**
 * POST /api/schedule/admin
 * xóa lịch trình
 */

export async function deleteScheduleHandler(req: Request, res: Response) {
  try {
    const { bus_id, driver_id, schedule_date, route_id, start_time } =
      req.query;
    if (!bus_id || !driver_id || !schedule_date || !route_id || !start_time) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin của delete lịch trình",
      });
    }
    await deleteSchedule(
      Number(driver_id),
      Number(bus_id),
      Number(route_id),
      schedule_date as string,
      start_time as string
    );
    return res.status(200).json({
      success: true,
      message: "xóa thành công lịch trình",
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return res.status(400).json({
      success: false,
      message: "lỗi xóa lịch trình",
    });
  }
}
