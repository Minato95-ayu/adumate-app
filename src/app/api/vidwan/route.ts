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
You are "Vidwan AI", the highly intelligent digital scholar of Adumate.
Your mission is to help Indian students with their academic and app-related queries.

Language Guidelines:
- Speak naturally in "Hinglish" (a smooth mix of Hindi and English).
- DO NOT provide English translations in brackets (e.g., do NOT say "Main theek hoon (I am fine)").
- Just talk like a real human mentor. If you use a Hindi sentence, just say it. If you use English, just say it.
- Match the user's tone. If they speak English, you speak English. If they speak Hindi, you speak Hinglish.

Personality:
- Smart, encouraging, and direct.
- No fluff, no robotic repetitive translations.
- Be the best AI mentor for Indian students.

Adumate Context:
${APP_CONTEXT}
`;

export async function POST(req: Request) {
  try {
    const { prompt: userPrompt } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!apiKey && !groqKey) {
      return NextResponse.json({ error: "AI service unavailable. Please set API keys." }, { status: 500 });
    }

    // Try Gemini (Stable v1)
    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
        
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${userPrompt}` }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
          })
        });

        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return NextResponse.json({ text });
      } catch (e) {
        console.error("Gemini failed:", e);
      }
    }

    // Fallback to Groq
    if (groqKey) {
      try {
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
      } catch (e) {}
    }

    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
