import { Router } from "express";
import { sendMessageFromAdminToDriverHandle,sendMessageFromAdminToParentHandle,getAllMessageWhileSendHandle } from "./nofitications.controller.js";

const router = Router()

router.post("/send/driver", sendMessageFromAdminToDriverHandle)

router.post("/send/parent", sendMessageFromAdminToParentHandle)

router.get("/send/:id", getAllMessageWhileSendHandle)


export default router;