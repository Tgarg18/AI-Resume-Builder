import imageKit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from "fs";

// Controller for getting user Resume
// POST: /api/resumes/create
export const createResume = async (req, res) => {
  try {
    // will be added by protect middleware
    const userId = req.userId;
    const { title } = req.body;

    // create new resume
    const newResume = await Resume.create({ userId, title });
    return res
      .status(200)
      .json({ message: "Resume Created", resume: newResume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// deleteResume
//  DELETE: /api/resumes/delete
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    await Resume.findOneAndDelete({ userId, _id: resumeId });
    res.status(200).json({ message: "Resume deleted" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get user resume by id
// GET: /api/resumes/get
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;
    if (!resumeId || !resumeId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid Resume ID" });
    }

    const getResume = await Resume.findOne({ userId, _id: resumeId });
    if (!getResume) {
      res.status(400).json({ message: "Resume Not Found" });
    }
    getResume.__v = undefined;
    getResume.createdAt = undefined;
    getResume.updatedAt = undefined;

    res.status(200).json({ resume: getResume });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// update resume
// PUT: /api/resumes/update
export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId, resumeData, removeBackground } = req.body;
    // if removeBackground is True--> we will use *multer*. using middleware
    const image = req.file;

    let resumeDataCopy = JSON.parse(JSON.stringify(resumeData));
    if (typeof resumeData === "string") {
      resumeDataCopy = await JSON.parse(resumeData);
    } else {
      resumeDataCopy = structuredClone(resumeData);
    }
    if (image) {
      const imageBufferData = fs.createReadStream(image.path);

      const response = await imageKit.files.upload({
        file: imageBufferData,
        fileName: "resume.png",
        folder: "user-resumes",
        transformation: {
          pre:
            "w-300, h-300,fo-face, z-0.75" +
            (removeBackground ? ",e-bgremove" : ""),
        },
      });
      resumeDataCopy.personal_info.image = response.url;
    }

    const resume = await Resume.findByIdAndUpdate(
      { userId, _id: resumeId },
      resumeDataCopy,
      { new: true }
    );
    return res.status(200).json({ message: "Changes Saved", resume });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
