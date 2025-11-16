import gemini from "../configs/gemini.js";
import Resume from "../models/Resume.js";

// controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await gemini.chat.completions.create({
      model: process.env.GEMINI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume writer specializing in crafting impactful and ATS-optimized summaries. Your task is to refine and enhance the candidate's professional summary into 1-2 powerful sentences that effectively highlight key technical skills, relevant experience, and career goals. The output must be concise, compelling, and ready for inclusion in a modern resume — return only the improved summary text only without any explainations or options.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });
    const aiContent = response.choices[0].message.content;
    return res.status(200).json({ aiContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Enhance the job-desc.
// POST: /api/ai/enhance-job-desc
export const enhanceJobDesc = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await gemini.chat.completions.create({
      model: process.env.GEMINI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer. Your task is to enhance the job description section of a resume by rewriting it into 1-2 concise, impactful sentences that emphasize key responsibilities, achievements, and measurable results. Use strong action verbs, maintain an ATS-friendly structure, and ensure the output is professional and results-driven. Return only the rewritten job description text without any explanations or options.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });
    const aiContent = response.choices[0].message.content;
    return res.status(200).json({ aiContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// controller for uploading a resume to the DataBase
// POST: /api/ai/upload-resume

export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId;

    if (!resumeText) {
      return res(400).json({ message: "Missing required field" });
    }

    const systemPrompt =
      "You are an expert AI agent to extract data from resume.";
    const userPrompt = `extract data from this resume: ${resumeText}. If (professional_summary) field is missing or undefined then fill them too which is most suitable fo it.
    Provide data in the following JSON format with no additional text before or after:
      professional_summary: {
        type: String,
        default: "",
      },
      skills: [
        {
          type: String,
        },
      ],
      personal_info: {
        image: { type: String, default: "" },
        profession: { type: String, default: "" },
        full_name: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        location: { type: String, default: "" },
        website: { type: String, default: "" },
      },
      experience: [
        {
          company: { type: String },
          position: { type: String },
          start_date: { type: String },
          end_date: { type: String },
          description: { type: String },
          is_current: { type: Boolean },
        },
      ],
      projects: [
        {
          name: { type: String },
          type: { type: String },
          description: { type: String },
        },
      ],
      education: [
        {
          institution: { type: String },
          degree: { type: String },
          graduation_date: { type: String },
          field: { type: String },
          gpa: { type: String },
        }`;

    const response = await gemini.chat.completions.create({
      model: process.env.GEMINI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
    });
    const aiContent = response.choices[0].message.content;
    const parsedData = JSON.parse(aiContent);
    const newResume = await Resume.create({ userId, title, ...parsedData });

    res.json({ resumeId: newResume._id });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
