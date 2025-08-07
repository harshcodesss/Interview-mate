import { Router } from "express";
import { startInterview } from "../controllers/interview.controller.js";
import { verifyjWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/start").post(verifyjWT,startInterview);

export default router;