import type { Request, Response } from "express";
import { MessageService } from "./message.service.js";
import { symbol } from "zod";

export const MessageController = {
  async getMessageByIdParent(req: Request, res: Response) {
    try {
      const idParent = Number(req.query.idParent);
      if (!idParent)
        return res
          .status(400)
          .json({ ok: false, error: "idParent is required" });
      const data = await MessageService.getMessageByIdParent(idParent);
      return res.json({ ok: true, data });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ ok: false, error: err.message });
    }
  },

  async sendMessageToAdminByIdParent(req: Request, res: Response) {
    try {
      const { idParent, message } = req.body;
      if (!idParent)
        return res
          .status(400)
          .json({ ok: false, error: "idParent is required" });
      if (!message || message === "")
        return res
          .status(400)
          .json({ ok: false, error: "Message mustn't empty!" });
      const data = await MessageService.sendMessageToAdminByIdParent(
        idParent,
        message
      );
      return res.json({ ok: true, data });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ ok: false, error: err.message });
    }
  },
  async sendMessageToParentByDriver(req: Request, res: Response) {
    try {
      const { driverId, parentId, studentName } = req.body;
      if (!driverId || !parentId || !studentName)
        return res
          .status(400)
          .json({
            ok: false,
            error: "driverid , parentid, stdentname bi thieu",
          });
      const data = await MessageService.sendMessageToParentByDriver(
        driverId,
        parentId,
        studentName
      );
      return res.json({ ok: true, data });
    } catch (error: any) {
      return res.status(500).json({ ok: false, error: error.message });
    }
  },
};
