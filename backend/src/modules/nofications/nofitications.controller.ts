import type { Request, Response } from "express";
import {
  sendMessageFromAdminToDriver,
  sendMessageFromAdminToParent,
  getAllMessageWhileSend,
} from "./nofitications.service.js";

export async function sendMessageFromAdminToDriverHandle(req: Request, res: Response) {
  try {
    const { adminId, mes } = req.body;
    if (!adminId)
      return res.json({ ok: false, message: "driver id khong dung" });
    if (mes == null || mes.trim().length === 0)
      return res.json({ ok: false, message: "message sai" });
    const data = await sendMessageFromAdminToDriver(adminId, mes.trim());
    console.log("message: ", data);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("failed to send message: ", err);
    return res.status(500).json({ ok: false });
  }
}

export async function sendMessageFromAdminToParentHandle(req: Request, res: Response) {
  try {
    const { adminId, mes } = req.body;
    if (!adminId)
      return res.json({ ok: false, message: "driver id khong dung" });
    if (mes == null || mes.trim().length === 0)
      return res.json({ ok: false, message: "message sai" });
    const data = await sendMessageFromAdminToDriver(adminId, mes);
    console.log("message: ", data);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("failed to send message: ", err);
    return res.status(500).json({ ok: false });
  }
}

export async function getAllMessageWhileSendHandle(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.json({ ok: false, message: "id khong dung" });
    const data = await getAllMessageWhileSend(id);
    console.log("all mes: ", data);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("failed to get all mess: ", err);
    return res.status(500).json({ ok: false });
  }
}
