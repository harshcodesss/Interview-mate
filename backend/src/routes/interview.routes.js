import { Router } from "express";
import { startInterview, askQuestion, endInterview } from "../controllers/interview.controller.js";
import { verifyjWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/start").post(verifyjWT,startInterview);
router.route("/ask/:id").post(verifyjWT,askQuestion);
router.route("/end/:id").post(verifyjWT,endInterview);

export default router;