import {
  getDriversHandler,
  getBusesHandler,
  getRoutesHandler,
  createScheduleHandler,
  getAllSchedulesHandler,
  deleteScheduleHandler,
  updateScheduleHandler,
} from "./schedule.controller.js";
import { authenticateToken } from "../../core/middlewares/auth.middleware.js";
import { authorizeRoles } from "../../core/middlewares/auth.middleware.js";
import { Router } from "express";
const router = Router();
/**
 * @route   GET /api/schedule/admin/drivers
 * @desc    lấy thông tin drivers
 */
router.get(
  "/admin/drivers",
  authenticateToken,
  authorizeRoles("admin"),
  getDriversHandler
);

/**
 * @route  GET /api/schedule/admin/buses
 * @desc   lấy thông tin của buses
 */
router.get(
  "/admin/buses",
  authenticateToken,
  authorizeRoles("admin"),
  getBusesHandler
);
/**
 * @route  GET /api/schedule/admin/routes
 * @desc   lấy thông tin của routes
 */
router.get(
  "/admin/routes",
  authenticateToken,
  authorizeRoles("admin"),
  getRoutesHandler
);

/**
 * @route  GET /api/schedule/admin/all
 * @desc   lấy thông tin tất cả schedule
 */
router.get(
  "/admin/all",
  authenticateToken,
  authorizeRoles("admin", "driver"),
  getAllSchedulesHandler
);

/**
 * @route  POST /api/schedule/admin
 * @desc  update schedule
 */
router.put(
  "/admin",
  authenticateToken,
  authorizeRoles("admin"),
  updateScheduleHandler
);

/**
 * @route  POST /api/schedule/admin
 * @desc  create schedule
 */
router.post(
  "/admin",
  authenticateToken,
  authorizeRoles("admin"),
  createScheduleHandler
);
/**
 * @route  POST /api/schedule/admin
 * @desc  delete schedule
 */
router.delete(
  "/admin",
  authenticateToken,
  authorizeRoles("admin"),
  deleteScheduleHandler
);

/**
 * @route  GET /api/schedule/driver/my-schedules
 * @desc   Lấy lịch trình của driver hiện tại
 */
router.get(
  "/driver/my-schedules",
  authenticateToken,
  authorizeRoles("driver"),
  getAllSchedulesHandler
);


export default router;
