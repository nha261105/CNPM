import type { Request,Response } from "express";
import { sendReportFromDriverToAdmin,getAllReportFromAdmin } from "./reports.service.js";


export async function sendReportFromDriverToAdminHandle(req: Request, res:Response) {
    try {
        const {driverId,mes} = req.body;
        if(!driverId) return res.json({ok: false,message: "id admin khong hop le"})
        if(mes === null || mes.trim().length === 0) {
            return res.json({ok: false, message: "noi dung tin nhan trong"})
        }
        const data = await sendReportFromDriverToAdmin(driverId,mes)
        return res.json({ok: true, data})
    } catch(err) {
        const error = err as Error;
        return res.json({ok: false, error})
    }
}

 export async function getAllReportFromAdminHandle(req: Request, res: Response) {
    try {
        const driverId = Number(req.params.driverId)
        if(!driverId) return res.json({ok: false, message: "id admin khong hop le"})
        const data = await getAllReportFromAdmin(driverId)
        return res.json({ok: true, data})
    } catch(err) {
        const error = err as Error;
        return res.json({ok: false,error})
    }
}