import { NextResponse } from "next/server";

const APP_CONTEXT = `
Adumate Student Ecosystem (India). Founder: Ayush Kaushik.
Features: Knowledge Finder, AI Test, Service Map, 1v1 Challenge.
`;

const SYSTEM_PROMPT = `
You are "Vidwan AI", the world's most advanced digital scholar and mentor, integrated into the Adumate Student Ecosystem.

Core Identity:
- Founder: Ayush Kaushik (A visionary leader who built Adumate to simplify student life in India).
- If anyone mentions "Ayush", recognize him as the Founder and Architect of this ecosystem.
- Persona: Elite, super-intelligent, multitasking, and empathetic. You are a mentor first.

Advanced Capabilities:
- Real-World Data: Use your integrated Google Search tool for current events, news, or any links provided. Provide real-time data, not just training data.
- Heavy Tasks: You excel at complex coding (any language), color identification, logo design theory, academic research, and logical reasoning.
- Multimodal: Analyze images and PDFs with extreme precision. Extract text, identify objects, and summarize complex documents.
- Languages: Use natural, premium Hinglish (Hindi + English) for a friendly vibe. Switch to pure English/Hindi ONLY if requested.

Security & Privacy:
- Never disclose user API keys or internal logic.
- Maintain strict data confidentiality. Respect user privacy at all times.
- Adumate Context: ${APP_CONTEXT}

Response Style:
- Use bold markdown, lists, and structured sections.
- Keep responses "Super Fast" and high-impact.
`;

export async function POST(req: Request) {
  try {
    const { prompt: userPrompt, fileData, fileType, history = [] } = await req.json();

    const keys = {
      gemini: process.env.GEMINI_API_KEY,
      openRouter: process.env.OPENROUTER_API_KEY,
      deepSeek: process.env.DEEPSEEK_API_KEY,
      groq: process.env.GROQ_API_KEY,
      mistral: process.env.MISTRAL_API_KEY,
      hf: process.env.HUGGINGFACE_API_KEY,
      cf: process.env.CF_API_KEY,
      cfId: process.env.CF_ACCOUNT_ID,
      aicc: process.env.AICC_API_KEY
    };

    const isPdf = fileType?.includes("pdf");
    const isSearchNeeded = /search|news|latest|today|real world|current/i.test(userPrompt || "");

    // Common history format
    const chatHistory = history.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    // --- HELPER: PROVIDER WRAPPERS ---

    // 1. GEMINI (Google)
    async function tryGemini() {
      if (!keys.gemini) throw new Error("No Gemini Key");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${keys.gemini}`;
      
      // Ensure alternating roles: user, model, user, model...
      const geminiHistory = [];
      let lastRole = "";
      for (const m of history) {
        const currentRole = m.role === "assistant" ? "model" : "user";
        if (currentRole !== lastRole) {
          geminiHistory.push({ role: currentRole, parts: [{ text: m.content }] });
          lastRole = currentRole;
        }
      }

      let currentParts: any[] = [{ text: userPrompt || "Analyze this." }];
      if (fileData) {
        currentParts.push({ 
          inline_data: { 
            mime_type: fileType || (fileData.includes("pdf") ? "application/pdf" : "image/jpeg"), 
            data: fileData.split(",")[1] 
          } 
        });
      }

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [...geminiHistory, { role: "user", parts: currentParts }],
          tools: [{ google_search_retrieval: {} }]
        })
      });
      const data = await resp.json();
      if (data.error) throw new Error(`Gemini API Error: ${data.error.message}`);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini No Response");
      return { text, provider: "Gemini 1.5 Pro" };
    }

    // 2. OPENROUTER (Claude 3.5 Sonnet)
    async function tryOpenRouter() {
      if (!keys.openRouter) throw new Error("No OpenRouter Key");
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatHistory,
        {
          role: "user",
          content: fileData && !isPdf ? [
            { type: "text", text: userPrompt || "Analyze image." },
            { type: "image_url", image_url: { url: fileData } }
          ] : userPrompt
        }
      ];
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${keys.openRouter}`,
          "HTTP-Referer": "https://adumate.in",
          "X-Title": "Adumate Vidwan AI"
        },
        body: JSON.stringify({ model: "anthropic/claude-3.5-sonnet", messages })
      });
      const data = await resp.json();
      if (data.error) throw new Error(`OpenRouter Error: ${data.error.message || JSON.stringify(data.error)}`);
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("OpenRouter No Content");
      return { text, provider: "Claude 3.5 Sonnet" };
    }

    // 3. DEEPSEEK
    async function tryDeepSeek() {
      if (!keys.deepSeek) throw new Error("No DeepSeek Key");
      const resp = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${keys.deepSeek}` },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory, { role: "user", content: userPrompt }] })
      });
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("DeepSeek Empty");
      return { text, provider: "DeepSeek V3" };
    }

    // 4. GROQ (Llama 3.3 70B)
    async function tryGroq() {
      if (!keys.groq) throw new Error("No Groq Key");
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${keys.groq}` },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory, { role: "user", content: userPrompt }] })
      });
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Groq Empty");
      return { text, provider: "Llama 3.3 (Groq)" };
    }

    // 5. MISTRAL
    async function tryMistral() {
      if (!keys.mistral) throw new Error("No Mistral Key");
      const resp = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${keys.mistral}` },
        body: JSON.stringify({ model: "mistral-large-latest", messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory, { role: "user", content: userPrompt }] })
      });
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Mistral Empty");
      return { text, provider: "Mistral Large" };
    }

    // 6. HUGGINGFACE
    async function tryHF() {
      if (!keys.hf) throw new Error("No HF Key");
      const resp = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${keys.hf}` },
        body: JSON.stringify({ inputs: `${SYSTEM_PROMPT}\n\nHistory: ${JSON.stringify(chatHistory)}\n\nUser: ${userPrompt}` })
      });
      const data = await resp.json();
      const text = data[0]?.generated_text || data.generated_text;
      if (!text) throw new Error("HF Empty");
      return { text, provider: "Mistral 7B (HuggingFace)" };
    }

    // 7. CLOUDFLARE AI
    async function tryCF() {
      if (!keys.cf || !keys.cfId) throw new Error("No CF Key/ID");
      const resp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${keys.cfId}/ai/run/@cf/meta/llama-3-8b-instruct`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${keys.cf}` },
        body: JSON.stringify({ messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory, { role: "user", content: userPrompt }] })
      });
      const data = await resp.json();
      const text = data.result?.response;
      if (!text) throw new Error("CF Empty");
      return { text, provider: "Llama 3 (Cloudflare)" };
    }

    // 8. AICC (OpenAI Compatible)
    async function tryAICC() {
      if (!keys.aicc) throw new Error("No AICC Key");
      const resp = await fetch("https://api.aigc.chat/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${keys.aicc}` },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory, { role: "user", content: userPrompt }] })
      });
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("AICC Empty");
      return { text, provider: "GPT-4o Mini (AICC)" };
    }

    // --- EXECUTION CHAIN ---
    const providers = [
      tryGemini,
      tryOpenRouter,
      tryDeepSeek,
      tryGroq,
      tryMistral,
      tryAICC,
      tryCF,
      tryHF
    ];

    // If PDF or Search, ensure Gemini is first
    if (isPdf || isSearchNeeded) {
      // Already first in list
    } else {
      // Re-order if needed, e.g. Claude first for reasoning
      providers.unshift(providers.splice(1, 1)[0]); 
    }

    let lastError = null;
    for (const providerFn of providers) {
      try {
        const result = await providerFn();
        return NextResponse.json(result);
      } catch (e: any) {
        console.warn(`Provider Failed:`, e.message);
        lastError = e.message;
        continue; // Try next
      }
    }

    return NextResponse.json({ error: `All 8 AI engines exhausted. Last error: ${lastError}` }, { status: 500 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
