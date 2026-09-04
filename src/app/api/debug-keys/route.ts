import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, string> = {};

  // Check which keys exist
  const keyChecks: Record<string, string | undefined> = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    CF_API_KEY: process.env.CF_API_KEY,
    CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
    AICC_API_KEY: process.env.AICC_API_KEY,
    FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };

  for (const [name, val] of Object.entries(keyChecks)) {
    results[name] = val ? `✅ SET (${val.slice(0, 6)}...)` : "❌ MISSING";
  }

  // Quick test: Gemini API
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Say hello in 5 words" }] }],
            generationConfig: { maxOutputTokens: 50 },
          }),
        }
      );
      const data = await resp.json();
      if (data.error) {
        results["GEMINI_TEST"] = `❌ FAILED: ${data.error.message}`;
      } else {
        results["GEMINI_TEST"] = `✅ WORKING: ${data.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 50)}`;
      }
    }
  } catch (e: any) {
    results["GEMINI_TEST"] = `❌ ERROR: ${e.message}`;
  }

  // Quick test: Groq API
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: "Say hello in 5 words" }],
          max_tokens: 50,
        }),
      });
      const data = await resp.json();
      if (data.error) {
        results["GROQ_TEST"] = `❌ FAILED: ${JSON.stringify(data.error)}`;
      } else {
        results["GROQ_TEST"] = `✅ WORKING: ${data.choices?.[0]?.message?.content?.slice(0, 50)}`;
      }
    }
  } catch (e: any) {
    results["GROQ_TEST"] = `❌ ERROR: ${e.message}`;
  }

  // Quick test: Firebase Admin Auth
  try {
    const { adminAuth } = await import("@/lib/firebase-admin");
    results["FIREBASE_ADMIN"] = adminAuth ? "✅ INITIALIZED" : "❌ NULL";
  } catch (e: any) {
    results["FIREBASE_ADMIN"] = `❌ ERROR: ${e.message}`;
  }

  return NextResponse.json(results, { status: 200 });
}
