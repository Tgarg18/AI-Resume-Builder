import OpenAI from "openai";

const gemini = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: process.env.BASE_URL,
});

export default gemini;
