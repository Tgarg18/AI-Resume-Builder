import express from "express";
import protect from "../Middlewares/authMiddleware.js";
import {
  createResume,
  deleteResume,
  getResumeById,
  updateResume,
} from "../controllers/resumeController.js";
import upload from "../configs/multer.js";

const resumeRouter = express.Router();

resumeRouter.post("/create", protect, createResume);
resumeRouter.delete("/delete/:resumeId", protect, deleteResume);
resumeRouter.get("/get/:resumeId", protect, getResumeById);
resumeRouter.put("/update", upload.single("image"), protect, updateResume);

export default resumeRouter;
