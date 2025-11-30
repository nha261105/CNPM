import { Router } from "express";
import { MessageController } from "./message.controller.js";

const router = Router();

router.get("/message", MessageController.getMessageByIdParent);
router.post(
  "/message/send/parent",
  MessageController.sendMessageToAdminByIdParent
);
router.post(
  "/message/send/parent/driver",
  MessageController.sendMessageToParentByDriver
);
export default router;
