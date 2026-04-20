import { NextResponse } from "next/server";

const PROVIDERS = [
  {
    name: "Groq",
    key: process.env.GROQ_API_KEY,
    url: "https://api.groq.com/openai/v1/chat/completions",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    type: "openai"
  },
  {
    name: "Gemini",
    key: process.env.GEMINI_API_KEY,
    url: "https://generativelanguage.googleapis.com/v1beta/models/",
    models: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"],
    type: "gemini"
  },
  {
    name: "AICC",
    key: process.env.AICC_API_KEY,
    url: "https://api.ai.cc/v1/chat/completions",
    models: ["gpt-4o-mini", "claude-3-haiku-20240307"],
    type: "openai"
  },
  {
    name: "OpenRouter",
    key: process.env.OPENROUTER_API_KEY,
    url: "https://openrouter.ai/api/v1/chat/completions",
    models: ["google/gemini-2.0-flash-001", "meta-llama/llama-3.1-8b-instruct"],
    type: "openai"
  },
  {
    name: "DeepSeek",
    key: process.env.DEEPSEEK_API_KEY,
    url: "https://api.deepseek.com/v1/chat/completions",
    models: ["deepseek-chat"],
    type: "openai"
  },
  {
    name: "Mistral",
    key: process.env.MISTRAL_API_KEY,
    url: "https://api.mistral.ai/v1/chat/completions",
    models: ["mistral-small-latest", "open-mixtral-8x7b"],
    type: "openai"
  },
  {
    name: "HuggingFace",
    key: process.env.HUGGINGFACE_API_KEY,
    url: "https://api-inference.huggingface.co/models/",
    models: ["mistralai/Mistral-7B-Instruct-v0.3", "meta-llama/Llama-3-8B-Instruct"],
    type: "hf"
  },
  {
    name: "Cloudflare",
    key: process.env.CF_API_KEY,
    url: `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/`,
    models: ["@cf/meta/llama-3-8b-instruct", "@cf/mistral/mistral-7b-instruct-v0.2"],
    type: "cf"
  }
];

export async function POST(req: Request) {
  try {
    const { prompt, json, image } = await req.json();
    let lastError = "";

    // Try each provider in order
    for (const provider of PROVIDERS) {
      if (!provider.key) continue;

      // Try each model for the current provider
      for (const model of provider.models) {
        try {
          let responseText = "";
          const timeout = 15000; // 15s timeout for vision

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          if (provider.type === "openai") {
            const messages: any[] = [];
            if (image) {
              messages.push({
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: image } }
                ]
              });
            } else {
              messages.push({ role: "user", content: prompt });
            }

            const resp = await fetch(provider.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${provider.key}`,
                "HTTP-Referer": "https://adumate.app",
                "X-Title": "Adumate"
              },
              signal: controller.signal,
              body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.5,
                response_format: json ? { type: "json_object" } : undefined
              })
            });
            clearTimeout(timeoutId);
            
            const data = await resp.json();
            if (data.error) throw new Error(data.error.message || `${provider.name} API Error`);
            responseText = data.choices?.[0]?.message?.content || "";
          } 
          else if (provider.type === "gemini") {
            const body: any = {
              contents: [{ 
                parts: [{ text: prompt }] 
              }],
              generationConfig: {
                temperature: 0.5,
                responseMimeType: json ? "application/json" : "text/plain"
              }
            };

            if (image) {
              // image is expected to be a data URL like "data:image/png;base64,..."
              const [mime, base64] = image.split(",");
              const mimeType = mime.split(":")[1].split(";")[0];
              body.contents[0].parts.push({
                inline_data: {
                  mime_type: mimeType,
                  data: base64
                }
              });
            }

            const resp = await fetch(`${provider.url}${model}:generateContent?key=${provider.key}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify(body)
            });
            clearTimeout(timeoutId);

            const data = await resp.json();
            if (data.error) throw new Error(data.error.message || "Gemini Error");
            responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          }
          else if (provider.type === "hf") {
            const resp = await fetch(`${provider.url}${model}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${provider.key}`
              },
              signal: controller.signal,
              body: JSON.stringify({ inputs: prompt })
            });
            clearTimeout(timeoutId);
            const data = await resp.json();
            responseText = data[0]?.generated_text || data.generated_text || "";
            // Clean up instruction tokens if present
            responseText = responseText.replace(/\[INST\][\s\S]*?\[\/INST\]/g, "").trim();
          }
          else if (provider.type === "cf") {
            const resp = await fetch(`${provider.url}${model}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${provider.key}`
              },
              signal: controller.signal,
              body: JSON.stringify({
                messages: [{ role: "user", content: prompt }]
              })
            });
            clearTimeout(timeoutId);
            const data = await resp.json();
            if (data.result) responseText = data.result.response || "";
          }

          if (responseText && responseText.trim()) {
            return NextResponse.json({ 
              text: responseText, 
              provider: provider.name,
              model: model 
            });
          }
        } catch (err: any) {
          console.error(`Fallback failed for ${provider.name} (${model}):`, err.message);
          lastError = `${provider.name}: ${err.message}`;
          continue; // Try next model or next provider
        }
      }
    }

    return NextResponse.json({ error: lastError || "ALL_PROVIDERS_FAILED" }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid Request Structure" }, { status: 400 });
  }
}
