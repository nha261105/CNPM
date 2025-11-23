import type { Request, Response } from "express";
import * as routeService from "./pickup_point.service.js"

export const getAllPickup = async(req: Request, res: Response) => {
    try {
        const getAllPickup = await routeService.getAllPickup();
        return res.json({ok: true, data: getAllPickup});
    } catch(error) {
        console.error("Get all pickup points error: ", error);
        return res.status(500).json({ok: false, error: "Failed to get all pickup points"});
    }
}