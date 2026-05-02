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
- Emojis: 1-2 max per response, only when they add meaning

## WHAT TO AVOID:
- ❌ Generic "subject to change" fake links — either give REAL verified URLs or none at all
- ❌ Over-formatted responses with too many bullet points for simple questions
- ❌ Repeating the question back to the user
- ❌ Saying "Great question!" or sycophantic openers
- ❌ Hallucinating specific statistics without noting uncertainty

## RESPONSE LENGTH:
- Simple greetings/casual: 2-4 lines max
- Factual questions: 1-3 paragraphs with key insight
- Deep analysis/essay: Use full structure with sections
- Always end with something that sparks further thinking

## ADUMATE CONTEXT:
${APP_CONTEXT}

Remember: You are Vidwan AI — sharp, warm, intellectually fearless. Make every response memorable.
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
    const isSearchNeeded = /search|news|latest|today|current|2024|2025|2026|real.?time|live|update/i.test(userPrompt || "");

    const chatHistory = history.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

    // --- PROVIDER 1: Claude 3.5 Sonnet (Best quality) ---
    async function tryClaude() {
      if (!keys.openRouter) throw new Error("No OpenRouter Key");
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatHistory,
        {
          role: "user",
          content:
            fileData && !isPdf
              ? [
                  { type: "text", text: userPrompt || "Analyze this image." },
                  { type: "image_url", image_url: { url: fileData } },
                ]
              : userPrompt,
        },
      ];
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keys.openRouter}`,
          "HTTP-Referer": "https://adumate.in",
          "X-Title": "Adumate Vidwan AI",
        },
        body: JSON.stringify({ model: "anthropic/claude-3.5-sonnet", messages, max_tokens: 2048 }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(`Claude: ${data.error.message}`);
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Claude: No content");
      return { text, provider: "Claude 3.5 Sonnet" };
    }

    // --- PROVIDER 2: Gemini 1.5 Pro (with real Google Search) ---
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

    // --- PROVIDER 3: Perplexity (Real-time web search) ---
    async function tryPerplexity() {
      if (!keys.openRouter) throw new Error("No OpenRouter Key");
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keys.openRouter}`,
          "HTTP-Referer": "https://adumate.in",
          "X-Title": "Adumate Vidwan AI",
        },
        body: JSON.stringify({
          model: "perplexity/llama-3.1-sonar-large-128k-online",
          messages: [
            { role: "system", content: SYSTEM_PROMPT + "\nProvide verified source URLs for all factual claims." },
            ...chatHistory,
            { role: "user", content: userPrompt },
          ],
          max_tokens: 2048,
        }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(`Perplexity: ${data.error.message}`);
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Perplexity: No content");
      return { text, provider: "Perplexity Sonar (Live Web)" };
    }

    // --- PROVIDER 4: Groq — Llama 3.3 70B (Fast fallback) ---
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


    // ============================================================
    // SMART EXECUTION CHAIN — Limit-Aware Priority
    // ============================================================
    //
    // TIER 1 — HIGH LIMITS (Use first, always available):
    //   Groq        → 30 RPM, ~14,400 req/day  ← BEST for normal use
    //   Gemini Flash → 15 RPM, 1,500 req/day   ← Great quality + speed
    //   DeepSeek    → ~500 req/day              ← Strong reasoning
    //
    // TIER 2 — MEDIUM LIMITS (Quality boost, use when Tier 1 fails):
    //   Claude 3.5  → OpenRouter credits        ← Best quality
    //   Gemini Pro  → 50 req/DAY only!          ← Reserve for complex
    //   Mistral     → 1 RPM free                ← Slow fallback
    //
    // TIER 3 — BACKUP (Always available, lower quality):
    //   Cloudflare  → 10,000 req/day            ← Solid backup
    //   HuggingFace → Unlimited but slow        ← Last resort
    //
    // SEARCH QUERIES: Perplexity (live web) → then normal chain
    // ============================================================

    let providerChain;

    if (isSearchNeeded) {
      // For news/real-time: Perplexity first (live web), then Gemini Pro (Google Search)
      providerChain = [
        tryPerplexity,   // Live web search — best for current events
        tryGemini,       // Gemini with Google Search retrieval
        tryGroq,         // Fast, high limit
        tryClaude,       // Quality fallback
        tryDeepSeek,
        tryMistral,
        tryCF,
        tryHF,
      ];
    } else {
      // Normal queries: High-limit models first, quality models as backup
      providerChain = [
        tryGroq,         // 🥇 PRIMARY: 30 RPM, 14k/day, Llama 3.3 70B — excellent
        tryGemini,       // 🥈 SECONDARY: Flash=1500/day, good quality
        tryDeepSeek,     // 🥉 TERTIARY: Strong reasoning, ~500/day
        tryClaude,       // 💎 QUALITY: Best but limited credits
        tryMistral,      // 🔄 FALLBACK: 1 RPM, decent
        tryCF,           // 🔄 BACKUP: 10k/day, always on
        tryHF,           // 🆘 LAST RESORT: Unlimited but slow
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
