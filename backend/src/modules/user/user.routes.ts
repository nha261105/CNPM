import { Router } from "express";
import * as userController from "./user.controller.js";

const router = Router();

router.get("/", userController.getUsers);
router.put("/:id", userController.updateUser); 
router.post("/", userController.addUser);

export default router;
