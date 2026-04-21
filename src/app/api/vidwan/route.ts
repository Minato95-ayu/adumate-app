import { NextResponse } from "next/server";

const APP_CONTEXT = `
Adumate Student Ecosystem (India).
Founder: Ayush Kaushik.
Features: Knowledge Finder, AI Test, Service Map, 1v1 Challenge.
`;

const SYSTEM_PROMPT = `
You are "Vidwan AI", the world's most advanced digital scholar.
Instructions:
- Use natural Hinglish (Hindi+English) without translations in brackets.
- You are extremely smart and can analyze files (images/PDFs) deeply.
- Provide beautiful markdown formatting with code blocks.
- Adumate Context: ${APP_CONTEXT}
`;

export async function POST(req: Request) {
  try {
    const { prompt: userPrompt, fileData, fileType } = await req.json();

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // --- STRATEGY 1: CLAUDE 3.5 SONNET (OPENROUTER) ---
    if (openRouterKey) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openRouterKey}`,
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: fileData ? [
                  { type: "text", text: userPrompt || "Analyze this file." },
                  { type: "image_url", image_url: { url: fileData } }
                ] : userPrompt
              }
            ]
          })
        });

        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return NextResponse.json({ text: data.choices[0].message.content, provider: "Claude 3.5 Sonnet" });
        }
        console.error("OpenRouter Error:", data);
      } catch (e) {
        console.error("Claude failed:", e);
      }
    }

    // --- STRATEGY 2: GEMINI 1.5 PRO ---
    if (geminiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`;
        
        let parts: any[] = [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${userPrompt}` }];
        if (fileData) {
          parts.push({
            inline_data: {
              mime_type: fileType || "image/jpeg",
              data: fileData.split(",")[1]
            }
          });
        }

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts }] })
        });

        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return NextResponse.json({ text, provider: "Gemini 1.5 Pro" });
        console.error("Gemini Pro Error:", data);
      } catch (e) {
        console.error("Gemini failed:", e);
      }
    }

    return NextResponse.json({ error: "High-tier models unavailable. Please check API keys." }, { status: 500 });

  } catch (error: any) {
    console.error("Global API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
