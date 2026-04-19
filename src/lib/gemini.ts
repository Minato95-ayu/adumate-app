import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateTestQuestions(subject: string, difficulty: string = "medium") {
  const prompt = `Generate 5 multiple choice questions for a test on the subject: ${subject}. 
  Difficulty level: ${difficulty}. 
  Return the output strictly in JSON format as an array of objects: 
  [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": 0,
      "explanation": "string"
    }
  ]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Extract JSON from text (sometimes Gemini wraps it in ```json ... ```)
    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

export async function solveDoubt(imageUrl: string, promptText: string) {
  // This would require the base64 of the image for Gemini 1.5 Vision
  // For now, returning a mock response or standard text response
  const prompt = `Solve this student doubt: ${promptText}. Provide a step-by-step clear explanation.`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error solving doubt. Please try again.";
  }
}
