/**
 * Multi-Provider AI Service
 * Handles fallback across multiple AI providers to ensure maximum uptime and best responses.
 */

interface AIResponse {
  text: string;
  provider: string;
  model: string;
}

const PROVIDERS = [
  {
    name: "Groq",
    key: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    url: "https://api.groq.com/openai/v1/chat/completions",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    type: "openai"
  },
  {
    name: "Gemini",
    key: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    url: "https://generativelanguage.googleapis.com/v1beta/models/",
    models: ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"],
    type: "gemini"
  },
  {
    name: "OpenRouter",
    key: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    url: "https://openrouter.ai/api/v1/chat/completions",
    models: ["google/gemini-2.0-flash-001", "meta-llama/llama-3.1-8b-instruct:free", "mistralai/mistral-7b-instruct:free"],
    type: "openai"
  },
  {
    name: "Mistral",
    key: process.env.NEXT_PUBLIC_MISTRAL_API_KEY,
    url: "https://api.mistral.ai/v1/chat/completions",
    models: ["mistral-tiny", "mistral-small"],
    type: "openai"
  },
  {
    name: "AICC",
    key: process.env.NEXT_PUBLIC_AICC_API_KEY,
    url: "https://api.ai.cc/v1/chat/completions",
    models: ["gpt-4o-mini", "gpt-3.5-turbo", "claude-3-haiku-20240307"],
    type: "openai"
  }
];

export async function multiCallAI(prompt: string, options: { json?: boolean } = {}): Promise<AIResponse> {
  let lastError = "";

  for (const provider of PROVIDERS) {
    if (!provider.key) continue;

    for (const model of provider.models) {
      try {
        console.log(`Trying ${provider.name} with model ${model}...`);
        
        let responseText = "";
        
        if (provider.type === "openai") {
          const resp = await fetch(provider.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${provider.key}`,
              "HTTP-Referer": "https://adumate.app", // For OpenRouter
              "X-Title": "Adumate"
            },
            body: JSON.stringify({
              model: model,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
              response_format: options.json ? { type: "json_object" } : undefined
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
                responseMimeType: options.json ? "application/json" : "text/plain"
              }
            })
          });
          
          const data = await resp.json();
          if (data.error) throw new Error(data.error.message || "Gemini Error");
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }

        if (responseText.trim()) {
          return { text: responseText, provider: provider.name, model };
        }
      } catch (err: any) {
        console.warn(`${provider.name} (${model}) failed:`, err.message);
        lastError = err.message;
        continue; // Try next model/provider
      }
    }
  }

  throw new Error("__ALL_PROVIDERS_EXHAUSTED__");
}
