import type { Request, Response } from "express";
import { StudentsService } from "./students.service.js";

export class StudentsController{
    static async getStudentsByIdParent(req: Request, res: Response){
        try {
            const idParent = Number(req.query.idParent);
            if(!idParent) return res.status(400).json({ ok: false, error: "idParent is required" });
            const data = await StudentsService.getStudentsByIdParent(idParent);
            return res.json({ok: true, data})
        } catch (err) {
            console.error("Get message: ", err)
            return res.status(500).json({ok: false, error: "Failed to get Message"})
        }
    }
}