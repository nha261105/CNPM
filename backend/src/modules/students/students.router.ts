import { Router } from "express";
import { StudentsController } from "./students.controller.js";

const router = Router()

router.get("/students", StudentsController.getStudentsByIdParent)

export default router;