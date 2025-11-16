import express from "express";
import {
  enhanceJobDesc,
  enhanceProfessionalSummary,
  uploadResume,
} from "../controllers/geminiController.js";
import protect from "../Middlewares/authMiddleware.js";

const geminiRouter = express.Router();

geminiRouter.post("/enhance-pro-sum", protect, enhanceProfessionalSummary);
geminiRouter.post("/enhance-job-desc", protect, enhanceJobDesc);
geminiRouter.post("/upload-resume", protect, uploadResume);

export default geminiRouter;
