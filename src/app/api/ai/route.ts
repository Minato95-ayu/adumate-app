import { NextResponse } from "next/server";

const PROVIDERS = [
  {
    name: "Groq",
    key: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    url: "https://api.groq.com/openai/v1/chat/completions",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
    type: "openai"
  },
  {
    name: "Gemini",
    key: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    url: "https://generativelanguage.googleapis.com/v1beta/models/",
    models: ["gemini-2.0-flash", "gemini-1.5-flash"],
    type: "gemini"
  },
  {
    name: "AICC",
    key: process.env.NEXT_PUBLIC_AICC_API_KEY,
    url: "https://api.ai.cc/v1/chat/completions",
    models: ["gpt-4o-mini", "claude-3-haiku-20240307"],
    type: "openai"
  }
];

export async function POST(req: Request) {
  try {
    const { prompt, json } = await req.json();
    let lastError = "";

    for (const provider of PROVIDERS) {
      if (!provider.key) continue;

      for (const model of provider.models) {
        try {
          let responseText = "";

          if (provider.type === "openai") {
            const resp = await fetch(provider.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${provider.key}`
              },
              body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                response_format: json ? { type: "json_object" } : undefined
              })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error.message || "API Error");
            responseText = data.choices?.[0]?.message?.content || "";
          } 
          else if (provider.type === "gemini") {
            const resp = await fetch(`${provider.url}${model}:generateContent?key=${provider.key}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.7,
                  responseMimeType: json ? "application/json" : "text/plain"
                }
              })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error.message || "Gemini Error");
            responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          }

          if (responseText.trim()) {
            return NextResponse.json({ text: responseText, provider: provider.name });
          }
        } catch (err: any) {
          lastError = err.message;
          continue;
        }
      }
    }

    return NextResponse.json({ error: lastError || "ALL_FAILED" }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }
}
