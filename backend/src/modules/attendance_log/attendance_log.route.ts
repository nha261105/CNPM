import { Router } from 'express';
import * as attendanceLogController from './attendance_log.controller.js';
import { authenticateToken } from '../../core/middlewares/auth.middleware.js';

const router = Router();
router.post('/check-in', authenticateToken, attendanceLogController.checkIn);
router.patch('/check-out', authenticateToken, attendanceLogController.checkOut);

export default router;