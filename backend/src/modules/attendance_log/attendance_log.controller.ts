import type { Request, Response } from 'express';
import * as attendanceLogService from './attendance_log.sevice.js';

export const checkIn = async (req: Request, res: Response) => {
    const { schedule_id, student_id, latitude, longitude } = req.body;
    if (!schedule_id || !student_id) {
        return res.status(400).json({ ok: false, error: 'Schedule ID and student ID are required' });
    }
    const attendanceLog = await attendanceLogService.checkIn({ schedule_id, student_id, latitude, longitude });
    return res.json({ ok: true, data: attendanceLog });
}

export const checkOut = async (req: Request, res: Response) => {
    const { schedule_id, student_id, latitude, longitude } = req.body;
    if (!schedule_id || !student_id) {
        return res.status(400).json({ ok: false, error: 'Schedule ID and student ID are required' });
    }
    const attendanceLog = await attendanceLogService.checkOut({ schedule_id, student_id, latitude, longitude });
    return res.json({ ok: true, data: attendanceLog });
}