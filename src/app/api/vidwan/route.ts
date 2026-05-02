import { NextResponse } from "next/server";

const TODAY = new Date().toLocaleDateString("en-IN", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

const APP_CONTEXT = `
Adumate Student Ecosystem (India) — Built by Ayush Kaushik.
Features: Vidwan AI (You), Knowledge Finder, AI Test, Service Map, 1v1 Challenge.
Website: https://adumate.in
`;

const SYSTEM_PROMPT = `
You are **Vidwan AI** — Adumate's elite AI scholar. You are NOT a basic chatbot.
You think like a Nobel laureate, debate like a top lawyer, and explain like the world's best teacher.
Today's date: ${TODAY}

## YOUR CORE IDENTITY:
- You are deeply knowledgeable, intellectually curious, and analytically sharp
- You don't just answer — you ANALYZE, CHALLENGE assumptions, and provide INSIGHT
- You are fluent in natural Hinglish (mix Hindi + English naturally — never forced)
- You treat every question as worthy of serious intellectual engagement

## RESPONSE QUALITY RULES:
1. **DEPTH OVER BREADTH**: Give one brilliant answer, not 10 shallow points
2. **SCHOLAR'S INSIGHT**: After facts, always add your own analysis — "Ye interesting isliye hai ki..."
3. **CONCRETE EXAMPLES**: Use real examples, analogies, stories to explain complex ideas
4. **CRITICAL THINKING**: Point out what most people miss or get wrong about the topic
5. **NATURAL HINGLISH**: Speak like an educated Indian friend, not a textbook

## FORMATTING (Use wisely — not every response needs heavy formatting):
- Use **bold** for key terms and important insights
- Use bullet points ONLY when listing 3+ distinct items
- For explanations, use flowing paragraphs — more readable than bullet soup
- Use --- as section divider only for long multi-section responses
## FORMATTING — SITUATION AWARE (Very Important):
Adapt your format to the question TYPE:
- **Casual/greeting** ("hello", "kya haal") → 1-2 warm lines, NO formatting, conversational
- **Simple fact** ("capital of France?") → 1-2 sentences, direct answer first
- **Explanation needed** → 2-3 flowing paragraphs, use bold for key terms, NO bullet soup
- **Comparison/list** → THEN use bullet points or table
- **Deep analysis/essay** → Sections with ### heading, paragraphs, 1-2 key bullet lists max
- **Code request** → Code block + brief explanation
- **Image in file** → Describe what you see in detail, then answer the question
- **PDF in file** → Extract key points, summarize intelligently

## STRICT RULES:
- ❌ NO fake "subject to change" links — real URL ya kuch nahi
- ❌ NO bullet points for casual conversation
- ❌ NO sycophantic openers ("Great question!", "Of course!")
- ❌ NO hallucinated statistics
- ✅ End every response with 1 thought-provoking insight or follow-up question
- ✅ Hinglish: natural mix, never forced
- ✅ Max 1-2 emojis only if they add meaning

## ADUMATE CONTEXT:
${APP_CONTEXT}

Remember: You are Vidwan AI — sharp, warm, intellectually fearless. Match your energy to the question.
`;

export async function POST(req: Request) {
  try {
    const { prompt: userPrompt, fileData, fileType, history = [] } = await req.json();

    if (!userPrompt && !fileData) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    const keys = {
      gemini: process.env.GEMINI_API_KEY,
      openRouter: process.env.OPENROUTER_API_KEY,
      deepSeek: process.env.DEEPSEEK_API_KEY,
      groq: process.env.GROQ_API_KEY,
      mistral: process.env.MISTRAL_API_KEY,
      hf: process.env.HUGGINGFACE_API_KEY,
      cf: process.env.CF_API_KEY,
      cfId: process.env.CF_ACCOUNT_ID,
      aicc: process.env.AICC_API_KEY,
    };

    const isPdf = fileType?.includes("pdf");
    const hasFile = !!fileData;
    const isSearchNeeded = /search|news|latest|today|current|2024|2025|2026|real.?time|live|update/i.test(userPrompt || "");
    const isImageGenRequest = /image bana|generate image|ek image|draw|create image|photo bana|picture bana|ek photo|design bana|poster bana|banner bana|logo bana/i.test(userPrompt || "");

    // 🎨 IMAGE GENERATION — Free via Pollinations.ai (no API key needed!)
    if (isImageGenRequest) {
      const imagePrompt = encodeURIComponent(
        (userPrompt || "beautiful abstract art")
          .replace(/image bana(o)?|generate image|ek image|draw|create image|photo bana(o)?|picture bana(o)?|design bana(o)?|poster bana(o)?|banner bana(o)?|logo bana(o)?/gi, "")
          .trim() || "beautiful creative artwork, high quality, detailed"
      );
      const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1024&height=768&nologo=true&seed=${Date.now()}`;
      const responseText = `Yeh raha! 🎨\n\n![Generated Image](${imageUrl})\n\n**Prompt used:** ${decodeURIComponent(imagePrompt)}\n\nAgar alag style ya scene chahiye ho toh describe karo — main dobara generate kar deta hoon!`;
      return NextResponse.json({ text: responseText, provider: "Pollinations AI (Image)" });
    }

    const chatHistory = history.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

    // --- PROVIDER 1: Gemini 1.5 Pro/Flash (with Google Search) ---
    async function tryGemini(modelName = "gemini-1.5-pro") {
      if (!keys.gemini) throw new Error("No Gemini Key");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${keys.gemini}`;
      const geminiHistory = [];
      let lastRole = "model";
      for (const m of history) {
        const role = m.role === "assistant" ? "model" : "user";
        if (role !== lastRole) {
          geminiHistory.push({ role, parts: [{ text: m.content }] });
          lastRole = role;
        }
      }
      const currentParts: unknown[] = [{ text: userPrompt || "Analyze this." }];
      if (fileData) {
        currentParts.push({
          inline_data: {
            mime_type: fileType || "image/jpeg",
            data: fileData.split(",")[1],
          },
        });
      }
      const body = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [...geminiHistory, { role: "user", parts: currentParts }],
        ...(isSearchNeeded ? { tools: [{ google_search_retrieval: {} }] } : {}),
        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
      };
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (data.error) {
        if (modelName === "gemini-1.5-pro") return tryGemini("gemini-1.5-flash");
        throw new Error(`Gemini: ${data.error.message}`);
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini: No text");
      return { text, provider: `Gemini 1.5 ${modelName.includes("pro") ? "Pro" : "Flash"}` };
    }

    // --- PROVIDER 2: Groq — Llama 3.3 70B (Primary) ---
    async function tryGroq() {
      if (!keys.groq) throw new Error("No Groq Key");
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${keys.groq}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory, { role: "user", content: userPrompt }],
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Groq: Empty response");
      return { text, provider: "Llama 3.3 70B (Groq)" };
    }

    // --- PROVIDER 5: DeepSeek V3 ---
    async function tryDeepSeek() {
      if (!keys.deepSeek) throw new Error("No DeepSeek Key");
      const resp = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${keys.deepSeek}` },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory, { role: "user", content: userPrompt }],
          max_tokens: 2048,
        }),
      });
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("DeepSeek: Empty");
      return { text, provider: "DeepSeek V3" };
    }

    // --- PROVIDER 6: Mistral Large ---
    async function tryMistral() {
      if (!keys.mistral) throw new Error("No Mistral Key");
      const resp = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${keys.mistral}` },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory, { role: "user", content: userPrompt }],
          max_tokens: 2048,
        }),
      });
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Mistral: Empty");
      return { text, provider: "Mistral Large" };
    }

    // --- PROVIDER 7: Cloudflare AI ---
    async function tryCF() {
      if (!keys.cf || !keys.cfId) throw new Error("No CF credentials");
      const resp = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${keys.cfId}/ai/run/@cf/meta/llama-3-8b-instruct`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${keys.cf}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory, { role: "user", content: userPrompt }],
          }),
        }
      );
      const data = await resp.json();
      const text = data.result?.response;
      if (!text) throw new Error("CF: Empty");
      return { text, provider: "Llama 3 (Cloudflare)" };
    }

    // --- PROVIDER 8: HuggingFace ---
    async function tryHF() {
      if (!keys.hf) throw new Error("No HF Key");
      const resp = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${keys.hf}` },
          body: JSON.stringify({
            inputs: `${SYSTEM_PROMPT}\n\nUser: ${userPrompt}\nAssistant:`,
            parameters: { max_new_tokens: 1024, temperature: 0.7 },
          }),
        }
      );
      const data = await resp.json();
      const text = data[0]?.generated_text || data.generated_text;
      if (!text) throw new Error("HF: Empty");
      return { text, provider: "Mistral 7B (HuggingFace)" };
    }

    // --- PROVIDER 7: AICC (GPT-4o Mini compatible) ---
    async function tryAICC() {
      if (!keys.aicc) throw new Error("No AICC Key");
      const resp = await fetch("https://api.aigc.chat/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${keys.aicc}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...chatHistory,
            { role: "user", content: userPrompt },
          ],
          max_tokens: 2048,
        }),
      });
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("AICC: Empty");
      return { text, provider: "GPT-4o Mini (AICC)" };
    }


    // ============================================================
    // SMART EXECUTION CHAIN — Available APIs Only
    // ============================================================
    //
    // ✅ TIER 1 — HIGH LIMITS (Primary workhorse):
    //   Groq (Llama 3.3 70B) → 30 RPM, 14,400/day  ← FASTEST
    //   Gemini 1.5 Flash     → 15 RPM, 1,500/day   ← GOOD QUALITY
    //
    // ✅ TIER 2 — MEDIUM LIMITS (Quality boost):
    //   DeepSeek V3          → ~500/day             ← STRONG REASONING
    //   AICC (GPT-4o Mini)   → Moderate limit       ← SMART + RELIABLE
    //   Gemini 1.5 Pro       → 50/day ONLY!         ← SAVE FOR SEARCH
    //
    // ✅ TIER 3 — BACKUP:
    //   Mistral Large        → 1 RPM free           ← SLOW
    //   Cloudflare AI        → 10,000/day           ← ALWAYS ON
    //   HuggingFace          → Unlimited (slow)     ← LAST RESORT
    //
    // ❌ Claude — No API key
    // ❌ Perplexity — No API key
    // ============================================================

    let providerChain;

    if (hasFile) {
      // 📎 FILE (image/PDF): Gemini MUST be first — only model that supports vision + PDF
      providerChain = [
        tryGemini,       // ✅ Supports image + PDF via inline_data
        tryDeepSeek,     // Text fallback (won't see file but will try with prompt)
        tryAICC,
        tryGroq,
        tryMistral,
        tryCF,
        tryHF,
      ];
    } else if (isSearchNeeded) {
      // 🔍 Search/News: Gemini first (has Google Search retrieval)
      providerChain = [
        tryGemini,       // Gemini Pro with Google Search
        tryGroq,
        tryDeepSeek,
        tryAICC,
        tryMistral,
        tryCF,
        tryHF,
      ];
    } else {
      // 💬 Normal queries: High-limit models first
      providerChain = [
        tryGroq,         // 🥇 30 RPM, 14k/day, Llama 3.3 70B
        tryGemini,       // 🥈 Flash=1500/day
        tryDeepSeek,     // 🥉 ~500/day
        tryAICC,         // 💡 GPT-4o Mini
        tryMistral,      // 🔄 1 RPM fallback
        tryCF,           // 🔄 10k/day backup
        tryHF,           // 🆘 Last resort
      ];
    }


    let lastError = "";
    for (const providerFn of providerChain) {
      try {
        const result = await providerFn();
        return NextResponse.json(result);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.warn(`[Vidwan] Provider failed: ${msg}`);
        lastError = msg;
      }
    }

    return NextResponse.json(
      { error: "All AI engines are currently unavailable. Please try again in a moment." },
      { status: 503 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Vidwan] Unexpected error:", message);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
