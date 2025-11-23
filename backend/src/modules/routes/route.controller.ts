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
export const addRoute = async (req: Request, res: Response) => {
    try {
        const routeData = req.body;
        if (!routeData) {
            return res.status(400).json({ok: false, error: "Route data is required"});
        }
        const addRoute = await routeService.addRoute(routeData);
        return res.json({ok: true, data: addRoute});
    } catch(error) {
        console.error("Add route error: ", error);
        return res.status(500)
    }
}

export const deleteRoute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ok: false, error: "Route id is required"});
        }
        const deleteRoute = await routeService.deleteRoute(parseInt(id));
        return res.json({ok: true, data: deleteRoute});
    } catch(error) {
        console.error("Delete route error: ", error);
        return res.status(500).json({ok: false, error: "Failed to delete route"});
    }
}

export const updateRoute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const payload = req.body;
        if (!id) {
            return res.status(400).json({ok: false, error: "Route id is required"});
        }
        const updateRoute = await routeService.updateRoute(parseInt(id), payload);
        return res.json({ok: true, data: updateRoute});
    } catch(error) {
        console.error("Update route error: ", error);
        return res.status(500).json({ok: false, error: "Failed to update route"});
    }
}