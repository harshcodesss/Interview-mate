import { Router } from "express";
import { startInterview, askQuestion } from "../controllers/interview.controller.js";
import { verifyjWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/start").post(verifyjWT,startInterview);
router.route("/:id/ask").post(verifyjWT,askQuestion);

export default router;