import type { Request, Response } from "express";
import { MessageService } from "./message.service.js";

export const MessageController = {
    async getMessageByIdParent(req: Request, res: Response) {
        try {
            const idParent = Number(req.query.idParent);
            if(!idParent) return res.status(400).json({ ok: false, error: "idParent is required" });
            const data = await MessageService.getMessageByIdParent(idParent);
            return res.json({ok: true, data})
        } catch (error) {
            const err = error as Error
            return res.status(500).json({ok: false, error: err.message})
        }
    },

    async sendMessageToAdminByIdParent(req: Request, res: Response) {
        try {
            const { idParent, message } = req.body;
            if(!idParent) return res.status(400).json({ ok: false, error: "idParent is required" });
            if(!message || message === "") return res.status(400).json({ ok: false, error: "Message mustn't empty!" });
            const data = await MessageService.sendMessageToAdminByIdParent(idParent, message);
            return res.json({ok: true, data})
        } catch (error) { 
            const err = error as Error
            return res.status(500).json({ok: false, error: err.message})
        }
    }
}