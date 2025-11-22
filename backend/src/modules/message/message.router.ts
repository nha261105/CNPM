import { Router } from "express";
import { MessageController } from "./message.controller.js";

const router = Router()

router.get("/message", MessageController.getMessageByIdParent)
router.post("/message/send/parent", MessageController.sendMessageToAdminByIdParent)

export default router;