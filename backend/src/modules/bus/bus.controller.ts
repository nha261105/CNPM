import { getBusLocationByParentIdService } from "./bus.service.js";

// Lấy vị trí bus động theo parent_id
export const getBusLocationByParentId = async (req: Request, res: Response) => {
  try {
    const parent_id = Number(req.query.parent_id);
    if (!parent_id) {
      return res
        .status(400)
        .json({ ok: false, error: "parent_id is required" });
    }
    const data = await getBusLocationByParentIdService(parent_id);
    if (!data)
      return res
        .status(404)
        .json({ ok: false, error: "No bus found for this parent" });
    return res.json({ ok: true, data });
  } catch (error) {
    console.error("Get bus location error: ", error);
    return res
      .status(500)
      .json({ ok: false, error: "Failed to get bus location" });
  }
};
import type { Request, Response } from "express";
import * as busService from "./bus.service.js";

export const getBuses = async (req: Request, res: Response) => {
  try {
    const buses = await busService.getAllBus();
    return res.json({ ok: true, data: buses });
  } catch (error) {
    console.error("Get buses error: ", error);
    return res.status(500).json({ ok: false, error: "Failed to get buses" });
  }
};

export const updateBus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    if (!id) {
      return res.status(400).json({ ok: false, error: "Bus ID is required" });
    }
    const updateBus = await busService.updateBus(parseInt(id), updateData);
    return res.json({ ok: true, data: updateBus });
  } catch (error) {
    console.error("Update bus error: ", error);
    return res.status(500).json({ ok: false, erorr: `Failed to update bus` });
  }
};

export const addBus = async (req: Request, res: Response) => {
  const busData = req.body;
  try {
    if (!busData) {
      return res.status(400).json({ ok: false, error: "Bus data is required" });
    }
    const addBus = await busService.addBus(busData);
    return res.json({ ok: true, data: addBus });
  } catch (error) {
    console.error("Add bus error: ", error);
    return res.status(500).json({ ok: false, error: "Failed to add bus" });
  }
};
