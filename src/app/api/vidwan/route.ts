import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const APP_CONTEXT = `
Adumate is a student ecosystem platform in India.
Features:
- Knowledge Finder (videos, notes, telegram)
- AI Test Generator
- Service Map (Libraries, Hostels, Mess, Tutors)
- 1v1 Challenge
- Founder: Ayush Kaushik
`;

const SYSTEM_PROMPT = `
You are "Vidwan AI", a helpful scholarly digital mentor for Adumate.
Your goal is to assist students with their queries in a clear, simple, and direct way.
Use a mix of Hindi and English (Hinglish) that is easy for Indian students to understand.
Be encouraging and educational.

Adumate Context:
${APP_CONTEXT}
`;

export async function POST(req: Request) {
  try {
    const { prompt: userPrompt } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!apiKey && !groqKey) {
      return NextResponse.json({ error: "AI keys are missing. Please add them to .env.local" }, { status: 500 });
    }

    // Try Gemini first (Using gemini-pro for better compatibility)
    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        
        const body = {
          contents: [
            {
              role: "user",
              parts: [{ text: `SYSTEM_INSTRUCTION: ${SYSTEM_PROMPT}\n\nUser Question: ${userPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        };

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        const data = await resp.json();
        if (data.error) {
          console.error("Gemini API Error:", data.error);
          throw new Error(data.error.message);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return NextResponse.json({ text });
      } catch (geminiError: any) {
        console.error("Gemini failed, falling back to Groq...", geminiError.message);
      }
    }

    // Fallback to Groq (Llama 3)
    if (groqKey) {
      try {
        const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${groqKey}` 
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7
          })
        });

        const groqData = await groqResp.json();
        if (groqData.error) {
          console.error("Groq API Error:", groqData.error);
          throw new Error(groqData.error.message);
        }

        const text = groqData.choices?.[0]?.message?.content;
        if (text) return NextResponse.json({ text });
      } catch (groqError: any) {
        console.error("Groq failed too:", groqError.message);
      }
    }

    return NextResponse.json({ error: "All AI providers failed. Check your API keys and internet." }, { status: 500 });

  } catch (error: any) {
    console.error("Global Vidwan API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
