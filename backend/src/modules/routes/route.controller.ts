import type { Request, Response } from "express";
import * as routeService from "./route.service.js"

export const getRoutes = async (req: Request, res: Response) => {
    try {
        const routes = await routeService.getAllRoutes();
        return res.json({ok: true, data: routes});
    } catch (error) {
        console.error("Get route error: ", error);
        return res.status(500).json({ok: false, error: "Failed to get routes"});
    }
}