import { multiCallAI } from "./ai-service";

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
    const res = await multiCallAI(prompt, { json: true });
    return JSON.parse(res.text.replace(/```json|```/g, "").trim());
  } catch (error) {
    console.error("AI Service Error:", error);
    return null;
  }
}

export async function solveDoubt(imageUrl: string, promptText: string) {
  const prompt = `Solve this student doubt: ${promptText}. Provide a step-by-step clear explanation.`;
  
  try {
    const res = await multiCallAI(prompt);
    return res.text;
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Error solving doubt. Please try again.";
  }
}
