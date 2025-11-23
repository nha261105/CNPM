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

export const updatePickUp = async(req: Request, res: Response) => {
    try {
        const { pickup_point_id, latitude, longitude, description } = req.body;
        if(!pickup_point_id) return res.status(500).json({ok: false, error: "Required pickup_point_id!"})
        if(!latitude) return res.status(500).json({ok: false, error: "Required latitude!"})
        if(!longitude) return res.status(500).json({ok: false, error: "Required longitude!"})
        if(!description) return res.status(500).json({ok: false, error: "Required description!"})
        const data = await routeService.updatePickUp(pickup_point_id, latitude, longitude, description);
        return res.json({ok: true, data: data})
    } catch (error) {
        const err = error as Error
        return res.status(500).json({ok: false, error: err.message});
    }
}