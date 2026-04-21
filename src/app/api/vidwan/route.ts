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
You are "Vidwan AI", the world-class digital scholar and multitasking assistant of Adumate.
Your mission is to help Indian students with academic queries, code, and document analysis.

Capabilities:
- You can analyze Images, PDFs, and Code files.
- You speak naturally in Hinglish (Hindi + English) without brackets.
- You provide beautiful, well-formatted answers.
- Use markdown for bold text and code blocks.

Personality:
- Extremely smart, like GPT-4o or Gemini 1.5 Pro.
- Witty, scholarly, and direct.

Adumate Context:
${APP_CONTEXT}
`;

export async function POST(req: Request) {
  try {
    const { prompt: userPrompt, fileData, fileType } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI keys missing." }, { status: 500 });
    }

    // Using Gemini 1.5 Flash (supports Vision/PDF/Files)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    let parts: any[] = [{ text: `SYSTEM: ${SYSTEM_PROMPT}\n\nUser Question: ${userPrompt}` }];

    // Handle Multimodal (Image/PDF)
    if (fileData && fileType) {
      parts.push({
        inline_data: {
          mime_type: fileType,
          data: fileData.split(",")[1] // Remove base64 prefix
        }
      });
    }

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
      })
    });

    const data = await resp.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I am processing the data...";
    
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Vidwan API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
