import type { Request, Response } from "express";
import * as busService from './bus.service.js';
import { error } from "console";

export const getBuses = async (req: Request, res: Response) => {
    try {
        const buses = await busService.getAllBus();
        return res.json({ok: true, data: buses});
    } catch(error) {
        console.error("Get buses error: ", error);
        return res.status(500).json({ok: false, error: "Failed to get buses"});
    }
}

export const updateBus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        if (!id) {
            return res.status(400).json({ok: false, error: "Bus ID is required"})
        }
        const updateBus = await busService.updateBus(parseInt(id), updateData);
        return res.json({ok: true, data: updateBus});
    } catch(error) {
        console.error("Update bus error: ", error);
        return res.status(500).json({ok: false, erorr: `Failed to update bus`});
    }
}

export const addBus = async (req : Request, res : Response) => {
    const busData = req.body;
    try {
        if (!busData) {
            return res.status(400).json({ok: false, error: "Bus data is required"});
        }
        const addBus = await busService.addBus(busData);
        return res.json({ok: true, data: addBus});
    } catch(error) {
        console.error("Add bus error: ", error);
        return res.status(500).json({ok: false, error: "Failed to add bus"});
    }
}

export const deleteBus = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).json({ ok : false, error: "Bus id is required"});
        }
        const deleteBus = await busService.deleteBus(parseInt(id));
        return res.json({ok: true, data: deleteBus});
    } catch (error) {
        console.error("Delete bus error: ", error);
        return res.status(500).json({ok: false, error: "Failed to delete bus"});
    }
}
