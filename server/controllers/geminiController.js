import gemini from "../configs/gemini.js";
import Resume from "../models/Resume.js";

/**
 * Helper: run the generative model with a single combined prompt and return plain text.
 * (Using simple string prompts keeps this robust even if the SDK surface changes.)
 */
async function runModel(modelName, prompt, options = {}) {
  const model = gemini.getGenerativeModel({ model: modelName });
  // The SDK examples allow passing a simple string to generateContent.
  // We use that pattern and return the textual response.
  const result = await model.generateContent(prompt, options);
  // result.response.text() is the typical accessor; guard against undefined.
  if (result?.response && typeof result.response.text === "function") {
    return result.response.text();
  }
  // fallback: try raw output
  return result?.response?.output?.[0]?.content?.[0]?.text ?? "";
}

// controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const systemPrompt =
      "You are a professional resume writer specializing in crafting impactful and ATS-optimized summaries. " +
      "Refine and enhance the candidate's professional summary into 1-2 powerful sentences that highlight key technical skills, relevant experience, and career goals. " +
      "The output must be concise, compelling, and ready for inclusion in a modern resume — return only the improved summary text with no explanations.";

    const prompt = `${systemPrompt}\n\nCandidate summary:\n${userContent}\n\nReturn only the improved summary text.`;

    const text = await runModel(process.env.GEMINI_MODEL, prompt, {
      // optional model settings, e.g. temperature or max tokens (SDK dependent)
      // temperature: 0.2,
      // maxOutputTokens: 256
    });

    return res.status(200).json({ aiContent: text.trim() });
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

    const systemPrompt =
      "You are an expert resume writer. Rewrite the job description section into 1-2 concise, impactful sentences emphasizing responsibilities, achievements, and measurable results. Use strong action verbs and keep it ATS-friendly. Return only the rewritten job description text without explanations.";

    const prompt = `${systemPrompt}\n\nJob description:\n${userContent}\n\nReturn only the rewritten job description.`;

    const text = await runModel(process.env.GEMINI_MODEL, prompt);

    return res.status(200).json({ aiContent: text.trim() });
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
      return res.status(400).json({ message: "Missing required field 'resumeText'" });
    }

    const systemPrompt = "You are an expert AI agent that extracts structured data from resumes.";
    const userPrompt = `
${systemPrompt}

Extract data from this resume text and output valid JSON only (no extra text). If professional_summary is missing, fill it with an appropriate 1-2 sentence summary.

Resume:
${resumeText}

Return JSON with these keys:
{
  "professional_summary": "",
  "skills": [],
  "personal_info": {
    "image": "",
    "profession": "",
    "full_name": "",
    "email": "",
    "phone": "",
    "location": "",
    "website": ""
  },
  "experience": [
    {
      "company": "",
      "position": "",
      "start_date": "",
      "end_date": "",
      "description": "",
      "is_current": false
    }
  ],
  "projects": [
    {
      "name": "",
      "type": "",
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "graduation_date": "",
      "field": "",
      "gpa": ""
    }
  ]
}
`;

    const prompt = userPrompt.trim();

    const text = await runModel(process.env.GEMINI_MODEL, prompt, {
      // set lower temperature for deterministic structure
      // temperature: 0.0,
      // maxOutputTokens: 800
    });

    const raw = text.trim();

    // Attempt to extract JSON from response (in case model added code fences or text)
    let jsonString = raw;
    // remove ```json or ``` wrappers if present
    if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    // Some models add explanatory lines; try to find first { ... } block
    const firstBrace = jsonString.indexOf("{");
    const lastBrace = jsonString.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.slice(firstBrace, lastBrace + 1);
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseErr) {
      // If parsing fails, return the raw text for debugging
      return res.status(500).json({
        message: "Failed to parse JSON from AI response",
        aiRaw: raw,
        parseError: parseErr.message,
      });
    }

    const newResume = await Resume.create({ userId, title, ...parsedData });

    return res.json({ resumeId: newResume._id });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
