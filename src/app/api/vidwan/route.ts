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
    // 1. Auth Check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Allow limited access without login for demo, or enforce strictly:
      // return NextResponse.json({ error: "Please login" }, { status: 401 });
    }

    const { prompt: userPrompt } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI Service is temporarily unavailable in production. Please check API keys." }, { status: 500 });
    }

    // Direct fetch to Gemini (Simple & Clean)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: `SYSTEM_INSTRUCTION: ${SYSTEM_PROMPT}\n\nUser Question: ${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    if (data.error) throw new Error(data.error.message || "Gemini Error");

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
    
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Vidwan API Error:", error);
    // Fallback to Groq if Gemini fails
    try {
      const groqKey = process.env.GROQ_API_KEY;
      if (groqKey) {
        const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt }
            ]
          })
        });
        const groqData = await groqResp.json();
        return NextResponse.json({ text: groqData.choices?.[0]?.message?.content });
      }
    } catch (e) {}

    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
