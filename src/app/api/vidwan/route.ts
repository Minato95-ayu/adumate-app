import { NextResponse } from "next/server";

const APP_CONTEXT = `
Adumate Student Ecosystem (India). Founder: Ayush Kaushik.
Features: Knowledge Finder, AI Test, Service Map, 1v1 Challenge.
`;

const SYSTEM_PROMPT = `
You are "Vidwan AI", the world's most advanced digital scholar.
You use a combination of Claude 3.5 Sonnet, Gemini 1.5 Pro, and DeepSeek intelligence.

Instructions:
- Use natural Hinglish (Hindi+English) without translations in brackets.
- Analyze files (images/PDFs) deeply.
- Provide beautiful markdown formatting.
- Adumate Context: ${APP_CONTEXT}
`;

export async function POST(req: Request) {
  try {
    const { prompt: userPrompt, fileData, fileType } = await req.json();

    const keys = {
      openRouter: process.env.OPENROUTER_API_KEY,
      gemini: process.env.GEMINI_API_KEY,
      deepSeek: process.env.DEEPSEEK_API_KEY,
      groq: process.env.GROQ_API_KEY
    };

    // --- TASK ROUTING ---
    // If there's a file, Gemini 1.5 Pro is usually the best/most stable for large context.
    // If it's code or reasoning, Claude 3.5 Sonnet is better.

    // 1. TRY OPENROUTER (Claude 3.5 Sonnet)
    if (keys.openRouter) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${keys.openRouter}`,
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
      } catch (e) { console.error("Claude Fallback..."); }
    }

    // 2. TRY GEMINI 1.5 PRO
    if (keys.gemini) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${keys.gemini}`;
        let parts: any[] = [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${userPrompt}` }];
        if (fileData) {
          parts.push({
            inline_data: {
              mime_type: fileType || "application/pdf",
              data: fileData.split(",")[1]
            }
          });
        }
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            contents: [{ role: "user", parts }],
            tools: [{ google_search_retrieval: {} }]
          })
        });
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return NextResponse.json({ text, provider: "Gemini 1.5 Pro" });
      } catch (e) { console.error("Gemini Fallback..."); }
    }

    // 3. TRY DEEPSEEK (Logic & Coding)
    if (keys.deepSeek) {
      try {
        const resp = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${keys.deepSeek}` },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt }
            ]
          })
        });
        const data = await resp.json();
        if (data.choices?.[0]?.message?.content) {
          return NextResponse.json({ text: data.choices[0].message.content, provider: "DeepSeek V3" });
        }
      } catch (e) { console.error("DeepSeek Fallback..."); }
    }

    // 4. TRY GROQ (Fast Fallback)
    if (keys.groq) {
      try {
        const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${keys.groq}` },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt }
            ]
          })
        });
        const data = await resp.json();
        if (data.choices?.[0]?.message?.content) {
          return NextResponse.json({ text: data.choices[0].message.content, provider: "Llama 3.3 (Groq)" });
        }
      } catch (e) {}
    }

    return NextResponse.json({ error: "All AI systems are busy. Try again." }, { status: 500 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
