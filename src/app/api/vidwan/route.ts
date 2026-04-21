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
- Analyze files (images/PDFs) deeply. If a PDF is provided, summarize and answer based on its contents.
- Real-world data: If the user provides a link or asks for latest information, use your integrated Google Search tool to get the most accurate data.
- Session Memory: You have access to previous messages in this session. Refer back to them if needed to maintain context.
- Provide beautiful markdown formatting with bold headers and lists.
- Adumate Context: ${APP_CONTEXT}
`;

export async function POST(req: Request) {
  try {
    const { prompt: userPrompt, fileData, fileType, history = [] } = await req.json();

    const keys = {
      openRouter: process.env.OPENROUTER_API_KEY,
      gemini: process.env.GEMINI_API_KEY,
      deepSeek: process.env.DEEPSEEK_API_KEY,
      groq: process.env.GROQ_API_KEY
    };

    const isPdf = fileType?.includes("pdf");
    const isSearchNeeded = /search|news|latest|today|real world|current/i.test(userPrompt || "");

    // Prepare History for OpenAI-style APIs (Claude, DeepSeek, Groq)
    const chatHistory = history.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    // --- TASK ROUTING ---
    
    // 1. TRY GEMINI 1.5 PRO - Best for PDF, Search, and Large Context
    // We prioritize Gemini if it's a PDF or a search-related query
    if (keys.gemini && (isPdf || isSearchNeeded || !keys.openRouter)) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${keys.gemini}`;
        
        const geminiHistory = history.map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));

        let currentParts: any[] = [{ text: userPrompt || "Analyze this file." }];
        if (fileData) {
          currentParts.push({
            inline_data: {
              mime_type: fileType || "image/jpeg",
              data: fileData.split(",")[1]
            }
          });
        }

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [
              ...geminiHistory,
              { role: "user", parts: currentParts }
            ],
            tools: [{ google_search_retrieval: {} }]
          })
        });
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return NextResponse.json({ text, provider: "Gemini 1.5 Pro (Search & Multimodal)" });
      } catch (e) { console.error("Gemini Fallback...", e); }
    }

    // 2. TRY OPENROUTER (Claude 3.5 Sonnet) - Best for general reasoning & Images
    if (keys.openRouter) {
      try {
        const messages = [
          { role: "system", content: SYSTEM_PROMPT },
          ...chatHistory,
          {
            role: "user",
            content: fileData && !isPdf ? [
              { type: "text", text: userPrompt || "Analyze this image." },
              { type: "image_url", image_url: { url: fileData } }
            ] : userPrompt
          }
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${keys.openRouter}`,
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            messages
          })
        });
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return NextResponse.json({ text: data.choices[0].message.content, provider: "Claude 3.5 Sonnet" });
        }
      } catch (e) { console.error("Claude Fallback..."); }
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
              ...chatHistory,
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
              ...chatHistory,
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
