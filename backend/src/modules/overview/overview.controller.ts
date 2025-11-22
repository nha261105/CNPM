import type { Request, Response } from "express";
import overviewService from "./overview.service.js";
import { error } from "console";

export async function getCardInOverview(req: Request, res: Response) {
    try {
        const data = await overviewService();
        return res.json({ok: true, data})
    } catch (err) {
        console.error("Get overview: ", err)
        return res.status(500).json({ok: false, error: "Failed to get Overview"})
    }
}